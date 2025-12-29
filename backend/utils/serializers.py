from datetime import datetime
from bson import ObjectId

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                result['id'] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(item) for item in value]
            else:
                result[key] = value
        return result
    
    return doc

def to_object_id(id_str):
    """Convert string ID to ObjectId, handle errors gracefully"""
    if id_str is None:
        return None
    try:
        # If it's already an ObjectId, return it
        if isinstance(id_str, ObjectId):
            return id_str
        # Try to convert string to ObjectId
        return ObjectId(id_str)
    except Exception as e:
        # Log the error but still return the string for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Invalid ObjectId format: {id_str}, error: {e}")
        # For section/plan IDs, we should raise an error if invalid
        # But for backward compatibility, return the string
        return id_str
