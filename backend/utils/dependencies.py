"""
Dependency injection utilities for FastAPI routes.
This module provides dependencies to access app state (db, logger) without circular imports.
"""
from fastapi import Request, HTTPException
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def get_db(request: Request):
    """
    Dependency to get database from app state.
    Use this in route functions: db = Depends(get_db)
    """
    # Get db from app state (use getattr to avoid AttributeError)
    db = getattr(request.app.state, 'db', None)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available. Please check MongoDB configuration."
        )
    return db


def get_logger(request: Request):
    """
    Dependency to get logger from app state.
    Use this in route functions: logger = Depends(get_logger)
    """
    return request.app.state.logger if hasattr(request.app.state, 'logger') else logger
