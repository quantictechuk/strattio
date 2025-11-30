from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime

# Load environment variables BEFORE imports
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'strattio_db')]

# Create the main app
app = FastAPI(title="Strattio API", version="1.0.0")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "strattio-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Import and include route modules (will be created next)
try:
    from routes.auth import router as auth_router
    from routes.plans import router as plans_router
    from routes.sections import router as sections_router
    from routes.financials import router as financials_router
    from routes.compliance import router as compliance_router
    from routes.exports import router as exports_router
    from routes.subscriptions import router as subscriptions_router
    from routes.stripe_routes import router as stripe_router
    
    api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    api_router.include_router(plans_router, prefix="/plans", tags=["Plans"])
    api_router.include_router(sections_router, tags=["Sections"])
    api_router.include_router(financials_router, tags=["Financials"])
    api_router.include_router(compliance_router, tags=["Compliance"])
    api_router.include_router(exports_router, prefix="/exports", tags=["Exports"])
    api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["Subscriptions"])
    api_router.include_router(stripe_router, prefix="/stripe", tags=["Stripe Payments"])
except ImportError as e:
    logger.warning(f"Some route modules not yet created: {e}")

# Include the router in the main app
app.include_router(api_router)

# ============================================================================
# MIDDLEWARE
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# LIFECYCLE EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    logger.info("Strattio API starting up...")
    
    # Create indexes
    try:
        await db.users.create_index("email", unique=True)
        await db.plans.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("Database indexes created")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
    
    logger.info("Strattio API ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Strattio API shutting down...")
    client.close()

# Make db and logger available globally for route modules
app.state.db = db
app.state.logger = logger
