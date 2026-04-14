from __future__ import annotations

from datetime import datetime, timezone


def build_staff_document(payload: dict, staff_id: str) -> dict:
    now = datetime.now(timezone.utc)
    shift = payload.get("shift") or {}

    return {
        "staff_id": staff_id,
        "name": payload["name"].strip(),
        "role": payload["role"].strip(),
        "department": payload["department"].strip(),
        "assigned_stall": payload["assigned_stall"].strip(),
        "shift": {
            "start_time": shift.get("start_time"),
            "end_time": shift.get("end_time"),
        },
        "status": payload.get("status", "Pending Onboarding"),
        "phone": payload["phone"],
        "email": payload["email"].strip().lower(),
        "joining_date": payload["joining_date"],
        "is_clocked_in": False,
        "last_clock_in": None,
        "last_clock_out": None,
        "worked_minutes": 0,
        "created_at": now,
        "updated_at": now,
    }


def serialize_staff(document: dict) -> dict:
    shift = document.get("shift") or {}
    return {
        "id": str(document.get("_id")),
        "staff_id": document.get("staff_id"),
        "name": document.get("name"),
        "role": document.get("role"),
        "department": document.get("department"),
        "assigned_stall": document.get("assigned_stall"),
        "shift": {
            "start_time": shift.get("start_time"),
            "end_time": shift.get("end_time"),
        },
        "status": document.get("status"),
        "phone": document.get("phone"),
        "email": document.get("email"),
        "joining_date": document.get("joining_date"),
        "is_clocked_in": bool(document.get("is_clocked_in", False)),
        "last_clock_in": document.get("last_clock_in"),
        "last_clock_out": document.get("last_clock_out"),
        "worked_minutes": int(document.get("worked_minutes", 0)),
        "created_at": document.get("created_at"),
        "updated_at": document.get("updated_at"),
    }
