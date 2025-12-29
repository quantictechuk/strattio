"""Achievement System routes - Badges, progress tracking, gamification"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
from datetime import datetime
import logging

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

# Achievement definitions
ACHIEVEMENTS = {
    "first_plan": {
        "badge_id": "first_plan",
        "badge_name": "First Steps",
        "description": "Created your first business plan",
        "icon": "🎯"
    },
    "financial_master": {
        "badge_id": "financial_master",
        "badge_name": "Financial Master",
        "description": "Completed financial projections for a plan",
        "icon": "💰"
    },
    "plan_perfectionist": {
        "badge_id": "plan_perfectionist",
        "badge_name": "Plan Perfectionist",
        "description": "Achieved 100% completion on a plan",
        "icon": "⭐"
    },
    "speed_runner": {
        "badge_id": "speed_runner",
        "badge_name": "Speed Runner",
        "description": "Completed a plan in less than 24 hours",
        "icon": "⚡"
    },
    "collaborator": {
        "badge_id": "collaborator",
        "badge_name": "Team Player",
        "description": "Invited a collaborator to a plan",
        "icon": "👥"
    },
    "export_expert": {
        "badge_id": "export_expert",
        "badge_name": "Export Expert",
        "description": "Exported 5 or more plans",
        "icon": "📄"
    },
    "quality_champion": {
        "badge_id": "quality_champion",
        "badge_name": "Quality Champion",
        "description": "Achieved a quality score of 80+ on a plan",
        "icon": "🏆"
    },
    "readiness_expert": {
        "badge_id": "readiness_expert",
        "badge_name": "Investment Ready",
        "description": "Achieved an investment readiness score of 80+",
        "icon": "💼"
    }
}

@router.get("/users/achievements")
async def get_user_achievements(
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get all achievements for the current user"""
    
    user_achievements = await db.user_achievements.find_one({"user_id": user_id})
    
    if not user_achievements:
        return {
            "user_id": user_id,
            "achievements": [],
            "total_badges": 0,
            "progress": {}
        }
    
    achievements_list = []
    for achievement in user_achievements.get("achievements", []):
        badge_info = ACHIEVEMENTS.get(achievement["badge_id"], {})
        achievements_list.append({
            **achievement,
            "badge_name": badge_info.get("badge_name", achievement["badge_id"]),
            "description": badge_info.get("description", ""),
            "icon": badge_info.get("icon", "🏅")
        })
    
    return {
        "user_id": user_id,
        "achievements": achievements_list,
        "total_badges": len(achievements_list),
        "progress": user_achievements.get("progress", {})
    }

@router.post("/users/achievements/check")
async def check_achievements(
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Check for new achievements and award them"""
    
    new_achievements = []
    
    # Get user data
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's plans
    plans = await db.plans.find({"user_id": user_id}).to_list(None)
    plan_count = len(plans)
    
    # Get user achievements
    user_achievements = await db.user_achievements.find_one({"user_id": user_id})
    earned_badge_ids = set()
    if user_achievements:
        earned_badge_ids = {a["badge_id"] for a in user_achievements.get("achievements", [])}
    
    # Check each achievement
    achievements_to_check = []
    
    # 1. First Plan
    if plan_count >= 1 and "first_plan" not in earned_badge_ids:
        achievements_to_check.append("first_plan")
    
    # 2. Financial Master
    financial_plans = await db.financial_models.find({"plan_id": {"$in": [str(p["_id"]) for p in plans]}}).to_list(None)
    if len(financial_plans) > 0 and "financial_master" not in earned_badge_ids:
        achievements_to_check.append("financial_master")
    
    # 3. Plan Perfectionist
    for plan in plans:
        sections = await db.sections.find({"plan_id": str(plan["_id"])}).to_list(None)
        total_sections = len(sections)
        completed_sections = sum(1 for s in sections if s.get("content") and len(s.get("content", "").strip()) > 50)
        if total_sections > 0 and (completed_sections / total_sections) >= 1.0 and "plan_perfectionist" not in earned_badge_ids:
            achievements_to_check.append("plan_perfectionist")
            break
    
    # 4. Speed Runner
    for plan in plans:
        created_at = plan.get("created_at")
        completed_at = plan.get("completed_at")
        if created_at and completed_at:
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            if isinstance(completed_at, str):
                completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
            hours = (completed_at - created_at).total_seconds() / 3600
            if hours < 24 and "speed_runner" not in earned_badge_ids:
                achievements_to_check.append("speed_runner")
                break
    
    # 5. Collaborator
    collaborator_count = await db.plan_collaborators.count_documents({"user_id": user_id})
    if collaborator_count > 0 and "collaborator" not in earned_badge_ids:
        achievements_to_check.append("collaborator")
    
    # 6. Export Expert
    export_count = await db.exports.count_documents({"user_id": user_id})
    if export_count >= 5 and "export_expert" not in earned_badge_ids:
        achievements_to_check.append("export_expert")
    
    # 7. Quality Champion
    for plan in plans:
        analytics = plan.get("analytics", {})
        quality_score = analytics.get("quality_score", 0)
        if quality_score >= 80 and "quality_champion" not in earned_badge_ids:
            achievements_to_check.append("quality_champion")
            break
    
    # 8. Readiness Expert
    for plan in plans:
        readiness_score = plan.get("readiness_score", {})
        overall_score = readiness_score.get("overall_score", 0)
        if overall_score >= 80 and "readiness_expert" not in earned_badge_ids:
            achievements_to_check.append("readiness_expert")
            break
    
    # Award new achievements
    for badge_id in achievements_to_check:
        badge_info = ACHIEVEMENTS.get(badge_id, {})
        achievement_doc = {
            "badge_id": badge_id,
            "badge_name": badge_info.get("badge_name", badge_id),
            "earned_at": datetime.utcnow().isoformat(),
            "progress": 100,
            "metadata": {}
        }
        
        if not user_achievements:
            user_achievements = {
                "user_id": user_id,
                "achievements": [achievement_doc],
                "total_badges": 1,
                "updated_at": datetime.utcnow()
            }
            await db.user_achievements.insert_one(user_achievements)
        else:
            await db.user_achievements.update_one(
                {"user_id": user_id},
                {
                    "$push": {"achievements": achievement_doc},
                    "$set": {
                        "total_badges": len(user_achievements.get("achievements", [])) + 1,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        
        new_achievements.append(achievement_doc)
        logger.info(f"Achievement awarded: {badge_id} to user {user_id}")
    
    return {
        "new_achievements": new_achievements,
        "total_new": len(new_achievements)
    }
