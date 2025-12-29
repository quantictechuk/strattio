"""
Vercel serverless function entry point for Strattio API
"""
import sys
import os
from pathlib import Path

# Add parent directory to path so we can import from backend
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set environment variables if not already set (for local development)
# In Vercel, these will be set automatically
if not os.environ.get('MONGO_URL'):
    from dotenv import load_dotenv
    load_dotenv(backend_dir / '.env')

# Import the FastAPI app and re-export it explicitly for Vercel's runtime
from server import app as fastapi_app

# Vercel expects the FastAPI app to be exported as 'app'
# Rebinding avoids any ambiguity during module inspection.
app = fastapi_app
