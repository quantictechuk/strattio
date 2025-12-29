"""Check if admin user exists in MongoDB"""

import asyncio
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / '.env')

async def check_admin_user():
    """Check admin user"""
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "strattio_db")
    
    if not mongo_url:
        print("Error: MONGO_URL not found in environment variables")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "pinakidebapu@gmail.com"
    
    user = await db.users.find_one({"email": admin_email})
    if user:
        print(f"✓ Admin user found: {admin_email}")
        print(f"  Role: {user.get('role', 'NOT SET')}")
        print(f"  User ID: {user['_id']}")
        print(f"  Has password_hash: {bool(user.get('password_hash'))}")
    else:
        print(f"✗ Admin user NOT found: {admin_email}")
        print("  Run: python create_admin_user.py")
    
    # Check total users
    total_users = await db.users.count_documents({})
    print(f"\nTotal users in database: {total_users}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_admin_user())
