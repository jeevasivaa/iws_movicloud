from __future__ import annotations

from typing import Callable

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database import get_collection
from app.models.user_model import serialize_user
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _build_auth_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise _build_auth_exception(str(exc)) from exc

    subject = payload.get("sub")
    if not subject or not ObjectId.is_valid(subject):
        raise _build_auth_exception("Invalid token subject")

    users_collection = get_collection("users")
    user_document = await users_collection.find_one({"_id": ObjectId(subject), "is_active": True})

    if not user_document:
        raise _build_auth_exception("User not found or inactive")

    return serialize_user(user_document)


def require_roles(*roles: str) -> Callable:
    allowed = {role.casefold() for role in roles}

    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = str(current_user.get("role", "")).casefold()
        if user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return role_checker
