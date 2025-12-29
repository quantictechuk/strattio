# Strattio API Server - Main FastAPI application
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

# Configure logging FIRST (before using logger)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    logger.warning("MONGO_URL not set - MongoDB features will not work")
    mongo_url = "mongodb://localhost:27017"  # Fallback for development
    client = None
    db = None
else:
    try:
        # For MongoDB Atlas (mongodb+srv://), SSL/TLS is handled automatically
        # Don't set tls=True explicitly for mongodb+srv:// as it's automatic
        # Add connection timeout and retry settings for serverless environments
        connection_params = {
            'serverSelectionTimeoutMS': 5000,  # 5 second timeout
            'connectTimeoutMS': 10000,  # 10 second connection timeout
            'socketTimeoutMS': 30000,  # 30 second socket timeout
            'retryWrites': True,
        }
        
        # Only set TLS explicitly for non-SRV connections
        if not mongo_url.startswith('mongodb+srv://'):
            connection_params['tls'] = True
        
        client = AsyncIOMotorClient(mongo_url, **connection_params)
        db = client[os.environ.get('DB_NAME', 'strattio_db')]
        logger.info("MongoDB client created successfully")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        import traceback
        traceback.print_exc()
        client = None
        db = None

# Create the main app
app = FastAPI(title="Strattio API", version="1.0.0")

# Set app state early (before routes are imported/registered)
# This ensures db is available when dependencies are resolved
app.state.db = db
app.state.logger = logger

# Add exception handler for CORS errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler to ensure CORS headers are always present"""
    from fastapi.responses import JSONResponse
    from fastapi import status
    
    # If it's a CORS-related error, make sure we return proper headers
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc) if hasattr(exc, '__str__') else "Internal server error"}
    )
    
    # Add CORS headers manually if needed
    origin = request.headers.get("origin")
    if origin:
        cors_origins_str = os.environ.get('CORS_ORIGINS', '*')
        if cors_origins_str == '*' or origin in [o.strip() for o in cors_origins_str.split(',')]:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

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
# Import auth router first (critical for login)
try:
    from routes.auth import router as auth_router
    api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    logger.info("✓ Auth routes loaded")
except ImportError as e:
    logger.error(f"Failed to load auth routes: {e}")
    raise

# Import other routes
try:
    from routes.plans import router as plans_router
    from routes.sections import router as sections_router
    from routes.financials import router as financials_router
    from routes.compliance import router as compliance_router
    from routes.exports import router as exports_router
    from routes.subscriptions import router as subscriptions_router
    from routes.stripe_routes import router as stripe_router
    from routes.contact import router as contact_router
    from routes.companies import router as companies_router
    from routes.swot import router as swot_router
    from routes.competitors import router as competitors_router
    from routes.audit_logs import router as audit_logs_router
    from routes.business_model_canvas import router as canvas_router
    from routes.oauth import router as oauth_router
    from routes.admin import router as admin_router
    from routes.tickets import router as tickets_router
    
    api_router.include_router(oauth_router, prefix="/auth", tags=["OAuth"])
    api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
    api_router.include_router(tickets_router, tags=["Tickets"])
    api_router.include_router(plans_router, prefix="/plans", tags=["Plans"])
    api_router.include_router(sections_router, tags=["Sections"])
    api_router.include_router(financials_router, tags=["Financials"])
    api_router.include_router(compliance_router, tags=["Compliance"])
    api_router.include_router(exports_router, prefix="/exports", tags=["Exports"])
    api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["Subscriptions"])
    api_router.include_router(stripe_router, prefix="/stripe", tags=["Stripe Payments"])
    api_router.include_router(contact_router, tags=["Contact"])
    api_router.include_router(companies_router, prefix="/companies", tags=["Companies"])
    api_router.include_router(swot_router, tags=["SWOT"])
    api_router.include_router(competitors_router, tags=["Competitors"])
    api_router.include_router(audit_logs_router, prefix="/audit-logs", tags=["Audit Logs"])
    api_router.include_router(canvas_router, tags=["Business Model Canvas"])
    logger.info("✓ All routes loaded successfully")
except ImportError as e:
    logger.error(f"Failed to load some routes: {e}")
    import traceback
    traceback.print_exc()

# ============================================================================
# MIDDLEWARE (MUST be added BEFORE routes for OPTIONS to work correctly)
# ============================================================================

# Parse CORS origins - handle whitespace and empty strings
cors_origins_str = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_str == '*':
    cors_origins = ['*']
else:
    # Split by comma, strip whitespace, filter empty strings
    cors_origins = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]

logger.info(f"CORS origins configured: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include the router in the main app (AFTER middleware)
app.include_router(api_router)

# ============================================================================
# LIFECYCLE EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    logger.info("Strattio API starting up...")
    
    if db is None:
        logger.warning("MongoDB not configured - database features will not work")
        logger.info("Strattio API ready (limited functionality)")
        return
    
    # Import database initialization utilities
    try:
        from utils.db_init import create_indexes, verify_connection, list_collections
        
        # Verify MongoDB connection
        connected = await verify_connection(db)
        if not connected:
            logger.error("Failed to connect to MongoDB - some features may not work")
        else:
            # List existing collections
            await list_collections(db)
            
            # Create all database indexes
            await create_indexes(db)
        
        logger.info("Strattio API ready!")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        import traceback
        traceback.print_exc()
        logger.info("Strattio API ready (with errors)")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Strattio API shutting down...")
    if client is not None:
        client.close()
