"""Script to create admin user"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Add parent directory to path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / '.env')

from utils.auth import get_password_hash

async def create_admin_user():
    """Create admin user"""
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "strattio_db")
    
    if not mongo_url:
        print("Error: MONGO_URL not found in environment variables")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "pinakidebapu@gmail.com"
    admin_password = "Login123Change"
    
    # Check if admin user already exists
    existing_user = await db.users.find_one({"email": admin_email})
    if existing_user:
        # Update to admin role and ensure password is set
        update_data = {
            "role": "admin",
            "password_hash": get_password_hash(admin_password),
            "updated_at": datetime.utcnow()
        }
        # Only update name if it's missing
        if not existing_user.get("name"):
            update_data["name"] = "Admin User"
        await db.users.update_one(
            {"email": admin_email},
            {"$set": update_data}
        )
        print(f"✓ Admin user updated: {admin_email}")
        print(f"  User ID: {existing_user['_id']}")
    else:
        # Create new admin user
        admin_doc = {
            "email": admin_email,
            "password_hash": get_password_hash(admin_password),
            "name": "Admin User",
            "role": "admin",
            "subscription_tier": "enterprise",
            "email_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(admin_doc)
        print(f"✓ Admin user created: {admin_email}")
        print(f"  User ID: {result.inserted_id}")
    
    # Create subscription for admin
    user = await db.users.find_one({"email": admin_email})
    user_id = str(user["_id"])
    
    existing_subscription = await db.subscriptions.find_one({"user_id": user_id})
    if not existing_subscription:
        await db.subscriptions.insert_one({
            "user_id": user_id,
            "tier": "enterprise",
            "status": "active",
            "plans_created_this_month": 0,
            "plan_limit": 999,
            "created_at": datetime.utcnow()
        })
        print(f"✓ Subscription created for admin user")
    
    print(f"\nAdmin credentials:")
    print(f"  Email: {admin_email}")
    print(f"  Password: {admin_password}")
    print(f"\n⚠️  Please change the password after first login!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
