from __future__ import annotations

from datetime import datetime, timezone


def build_user_document(name: str, email: str, password_hash: str, role: str) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "password_hash": password_hash,
        "role": role,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }


def serialize_user(document: dict) -> dict:
    return {
        "id": str(document.get("_id")),
        "name": document.get("name"),
        "email": document.get("email"),
        "role": document.get("role"),
        "is_active": bool(document.get("is_active", True)),
        "created_at": document.get("created_at"),
        "updated_at": document.get("updated_at"),
    }
