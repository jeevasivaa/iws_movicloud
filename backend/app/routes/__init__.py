"""API route modules for FastAPI endpoints."""

from app.routes.auth_routes import router as auth_router
from app.routes.staff_routes import router as staff_router

__all__ = ["auth_router", "staff_router"]
