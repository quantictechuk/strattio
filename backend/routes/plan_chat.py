"""Plan chat routes - AI advisor chat for plan assistance"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import logging
from bson import ObjectId
import os

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str
    section_id: Optional[str] = None  # Optional: context about which section user is viewing

@router.post("/plans/{plan_id}/chat")
async def send_chat_message(
    plan_id: str,
    chat_data: ChatMessage,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Send a message to the AI plan advisor and get a response"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get plan context
    sections = await db.sections.find({"plan_id": plan_id}).sort("order_index", 1).to_list(None)
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    research_pack = await db.research_packs.find_one({"plan_id": plan_id})
    
    # Get current section if provided
    current_section = None
    if chat_data.section_id:
        current_section = next((s for s in sections if s.get("_id") == to_object_id(chat_data.section_id)), None)
    
    # Build context for AI
    plan_context = {
        "plan_name": plan.get("name", ""),
        "plan_purpose": plan.get("plan_purpose", "generic"),
        "business_name": plan.get("intake_data", {}).get("business_name", ""),
        "industry": plan.get("intake_data", {}).get("industry", ""),
        "business_description": plan.get("intake_data", {}).get("business_description", ""),
        "sections": [{
            "type": s.get("section_type", ""),
            "title": s.get("title", ""),
            "content": s.get("content", "")[:500] if s.get("content") else ""  # First 500 chars
        } for s in sections[:10]],  # Limit to first 10 sections
        "current_section": {
            "type": current_section.get("section_type", "") if current_section else None,
            "title": current_section.get("title", "") if current_section else None,
            "content": current_section.get("content", "")[:1000] if current_section and current_section.get("content") else None
        } if current_section else None,
        "has_financials": financial_model is not None,
        "has_research": research_pack is not None
    }
    
    # Build system prompt
    system_prompt = f"""You are an expert business plan advisor helping a user improve their business plan.

Plan Context:
- Plan Name: {plan_context["plan_name"]}
- Business: {plan_context["business_name"]}
- Industry: {plan_context["industry"]}
- Purpose: {plan_context["plan_purpose"]}
- Description: {plan_context["business_description"]}

Current Section: {plan_context["current_section"]["title"] if plan_context["current_section"] else "General plan view"}

Your role:
1. Provide specific, actionable advice based on the plan context
2. Reference specific sections or data when relevant
3. Suggest improvements that are practical and implementable
4. Be encouraging but honest about areas needing work
5. If asked about a specific section, focus your advice on that section
6. Use the plan's actual data (business name, industry, etc.) in your responses
7. Keep responses concise but helpful (2-4 paragraphs max)

Important:
- DO NOT make up data or statistics
- DO NOT provide generic advice - be specific to this plan
- DO reference the plan's actual content when relevant
- DO suggest concrete next steps when possible
"""
    
    # Build user message with context
    user_message_text = chat_data.message
    
    # Add section context if available
    if plan_context["current_section"]:
        user_message_text += f"\n\n[Context: User is viewing the '{plan_context['current_section']['title']}' section]"
    
    try:
        # Initialize chat
        chat = LlmChat(
            api_key=os.environ.get("OPENAI_API_KEY"),
            session_id=f"plan_chat_{plan_id}_{user_id}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        # Send message
        response = await chat.send_message(UserMessage(text=user_message_text))
        
        # Store message in database
        message_doc = {
            "plan_id": plan_id,
            "user_id": user_id,
            "user_message": chat_data.message,
            "assistant_message": response,
            "section_id": chat_data.section_id,
            "created_at": datetime.utcnow()
        }
        
        await db.plan_chats.insert_one(message_doc)
        
        logger.info(f"Chat message sent for plan {plan_id} by user {user_id}")
        
        return {
            "message": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")

@router.get("/plans/{plan_id}/chat/history")
async def get_chat_history(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
    limit: int = 50
):
    """Get chat history for a plan"""
    
    # Verify plan access
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get chat history
    chats = await db.plan_chats.find({
        "plan_id": plan_id,
        "user_id": user_id
    }).sort("created_at", -1).limit(limit).to_list(None)
    
    # Reverse to show chronological order
    chats.reverse()
    
    return {
        "messages": [serialize_doc(chat) for chat in chats],
        "total": len(chats)
    }
