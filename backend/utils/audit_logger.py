"""Audit Logger - Track user activities and plan changes"""

from typing import Dict, Optional
from datetime import datetime
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

class AuditLogger:
    """Logs user activities and plan changes for audit trail"""
    
    ACTIVITY_TYPES = {
        'plan_created': 'Plan Created',
        'plan_updated': 'Plan Updated',
        'plan_deleted': 'Plan Deleted',
        'plan_generated': 'Plan Generated',
        'plan_duplicated': 'Plan Duplicated',
        'section_updated': 'Section Updated',
        'section_regenerated': 'Section Regenerated',
        'swot_regenerated': 'SWOT Regenerated',
        'competitor_regenerated': 'Competitor Analysis Regenerated',
        'export_created': 'Export Created',
        'export_downloaded': 'Export Downloaded',
        'financials_viewed': 'Financials Viewed',
        'compliance_checked': 'Compliance Checked',
        'user_registered': 'User Registered',
        'user_logged_in': 'User Logged In',
        'subscription_upgraded': 'Subscription Upgraded',
        'company_created': 'Company Created',
        'company_updated': 'Company Updated',
        'company_deleted': 'Company Deleted'
    }
    
    @staticmethod
    async def log_activity(
        db,
        user_id: str,
        activity_type: str,
        entity_type: str,
        entity_id: str,
        details: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ):
        """
        Log an activity to the audit_logs collection
        
        Args:
            db: MongoDB database instance
            user_id: ID of user performing the action
            activity_type: Type of activity (from ACTIVITY_TYPES)
            entity_type: Type of entity (plan, section, export, etc.)
            entity_id: ID of the entity
            details: Additional details about the activity
            metadata: Additional metadata (IP address, user agent, etc.)
        """
        try:
            log_entry = {
                "user_id": user_id,
                "activity_type": activity_type,
                "activity_name": AuditLogger.ACTIVITY_TYPES.get(activity_type, activity_type),
                "entity_type": entity_type,
                "entity_id": entity_id,
                "details": details or {},
                "metadata": metadata or {},
                "timestamp": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            
            await db.audit_logs.insert_one(log_entry)
            logger.debug(f"Logged activity: {activity_type} for {entity_type} {entity_id}")
            
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")
            # Don't raise - audit logging should not break main functionality
    
    @staticmethod
    async def get_user_activities(
        db,
        user_id: str,
        limit: int = 50,
        skip: int = 0,
        activity_type: Optional[str] = None,
        entity_type: Optional[str] = None
    ):
        """
        Get activity logs for a user
        
        Args:
            db: MongoDB database instance
            user_id: ID of user
            limit: Maximum number of logs to return
            skip: Number of logs to skip
            activity_type: Filter by activity type
            entity_type: Filter by entity type
            
        Returns:
            List of activity log entries
        """
        query = {"user_id": user_id}
        
        if activity_type:
            query["activity_type"] = activity_type
        
        if entity_type:
            query["entity_type"] = entity_type
        
        cursor = db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        logs = await cursor.to_list(limit)
        
        # Convert ObjectId to string
        for log in logs:
            log["_id"] = str(log["_id"])
            log["entity_id"] = str(log.get("entity_id", ""))
        
        return logs
    
    @staticmethod
    async def get_entity_activities(
        db,
        entity_type: str,
        entity_id: str,
        limit: int = 50
    ):
        """
        Get activity logs for a specific entity
        
        Args:
            db: MongoDB database instance
            entity_type: Type of entity
            entity_id: ID of entity
            limit: Maximum number of logs to return
            
        Returns:
            List of activity log entries
        """
        query = {
            "entity_type": entity_type,
            "entity_id": entity_id
        }
        
        cursor = db.audit_logs.find(query).sort("timestamp", -1).limit(limit)
        logs = await cursor.to_list(limit)
        
        # Convert ObjectId to string
        for log in logs:
            log["_id"] = str(log["_id"])
            log["entity_id"] = str(log.get("entity_id", ""))
        
        return logs
