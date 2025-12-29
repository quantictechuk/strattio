"""Database initialization and index creation for Strattio"""

import logging

logger = logging.getLogger(__name__)

async def create_indexes(db):
    """Create all necessary indexes for the Strattio database.
    
    Based on Backend_Database_Documentation.md
    """
    logger.info("Creating database indexes...")
    
    try:
        # Users Collection
        await db.users.create_index("email", unique=True)
        await db.users.create_index([("created_at", -1)])
        logger.info("✓ Created indexes for 'users' collection")
        
        # Plans Collection
        await db.plans.create_index([("user_id", 1), ("created_at", -1)])
        await db.plans.create_index("status")
        logger.info("✓ Created indexes for 'plans' collection")
        
        # Sections Collection
        await db.sections.create_index([("plan_id", 1), ("order_index", 1)])
        await db.sections.create_index("section_type")
        logger.info("✓ Created indexes for 'sections' collection")
        
        # Subscriptions Collection
        await db.subscriptions.create_index("user_id", unique=True)
        await db.subscriptions.create_index("stripe_subscription_id", sparse=True)
        logger.info("✓ Created indexes for 'subscriptions' collection")
        
        # Research Packs Collection
        await db.research_packs.create_index("plan_id")
        await db.research_packs.create_index([("retrieved_at", -1)])
        logger.info("✓ Created indexes for 'research_packs' collection")
        
        # Financial Models Collection
        await db.financial_models.create_index("plan_id")
        logger.info("✓ Created indexes for 'financial_models' collection")
        
        # Compliance Reports Collection
        await db.compliance_reports.create_index("plan_id")
        logger.info("✓ Created indexes for 'compliance_reports' collection")
        
        # Exports Collection
        await db.exports.create_index("plan_id")
        await db.exports.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("✓ Created indexes for 'exports' collection")
        
        # Audit Logs Collection
        await db.audit_logs.create_index([("user_id", 1), ("created_at", -1)])
        await db.audit_logs.create_index("plan_id")
        await db.audit_logs.create_index("action")
        logger.info("✓ Created indexes for 'audit_logs' collection")
        
        # Payment Transactions Collection (for Stripe)
        await db.payment_transactions.create_index("session_id", unique=True)
        await db.payment_transactions.create_index("user_id")
        await db.payment_transactions.create_index([("created_at", -1)])
        logger.info("✓ Created indexes for 'payment_transactions' collection")
        
        # Companies Collection
        await db.companies.create_index([("user_id", 1), ("created_at", -1)])
        await db.companies.create_index([("user_id", 1), ("business_name", 1)])
        logger.info("✓ Created indexes for 'companies' collection")
        
        logger.info("All database indexes created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        return False


async def verify_connection(db):
    """Verify MongoDB connection is working"""
    try:
        # Run a simple command to verify connection
        await db.command("ping")
        logger.info("✓ MongoDB connection verified")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return False


async def list_collections(db):
    """List all collections in the database"""
    try:
        collections = await db.list_collection_names()
        logger.info(f"Existing collections: {collections}")
        return collections
    except Exception as e:
        logger.error(f"Error listing collections: {e}")
        return []
