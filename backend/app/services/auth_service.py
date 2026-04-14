from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_collection
from app.models.user_model import build_user_document, serialize_user
from app.schemas.auth import LoginPayload, LoginRequest
from app.utils.config import get_settings
from app.utils.security import create_access_token, hash_password, verify_password

settings = get_settings()

DEFAULT_USERS = [
    {
        "name": "Admin User",
        "email": "admin@vsafoods.com",
        "password": "password123",
        "role": "Admin",
    },
    {
        "name": "Anita Sharma",
        "email": "anita@vsafoods.com",
        "password": "password123",
        "role": "Staff",
    },
]


async def login_user(payload: LoginRequest) -> LoginPayload:
    users_collection = get_collection("users")
    email = payload.email.strip().lower()

    user_document = await users_collection.find_one({"email": email})
    if not user_document:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(payload.password, user_document.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user_document.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled")

    user_data = serialize_user(user_document)
    access_token = create_access_token(
        subject=user_data["id"],
        role=user_data["role"],
        email=user_data["email"],
        name=user_data["name"],
    )

    return LoginPayload(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.jwt_expire_minutes * 60,
        user=user_data,
    )


async def seed_default_users() -> None:
    users_collection = get_collection("users")

    for user in DEFAULT_USERS:
        existing = await users_collection.find_one({"email": user["email"].lower()})
        if existing:
            continue

        user_document = build_user_document(
            name=user["name"],
            email=user["email"],
            password_hash=hash_password(user["password"]),
            role=user["role"],
        )
        await users_collection.insert_one(user_document)

    await users_collection.update_many(
        {"is_active": {"$exists": False}},
        {
            "$set": {
                "is_active": True,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
