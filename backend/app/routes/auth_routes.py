from __future__ import annotations

from fastapi import APIRouter

from app.schemas.auth import LoginRequest
from app.services.auth_service import login_user
from app.utils.responses import success_response

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
async def login(payload: LoginRequest):
    login_payload = await login_user(payload)
    return success_response("Login successful", login_payload.model_dump())
