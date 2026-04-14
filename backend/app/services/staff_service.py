from __future__ import annotations

import re
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import ReturnDocument

from app.database import get_collection
from app.models.staff_model import build_staff_document, serialize_staff
from app.schemas.staff import StaffCreate, StaffStatusUpdate, StaffUpdate

SAMPLE_STAFF = [
    {
        "staff_id": "STF-0001",
        "name": "Amit Shah",
        "role": "Head Chef",
        "department": "Kitchen",
        "assigned_stall": "Main Square Stall",
        "shift": {"start_time": "06:00", "end_time": "14:00"},
        "status": "Active",
        "phone": "9876543210",
        "email": "amit@example.com",
        "joining_date": datetime(2024, 1, 10, tzinfo=timezone.utc).date(),
    },
    {
        "staff_id": "STF-0002",
        "name": "Sanya Mirza",
        "role": "Cashier",
        "department": "Front Desk",
        "assigned_stall": "South Avenue Cart",
        "shift": {"start_time": "14:00", "end_time": "22:00"},
        "status": "Off Duty",
        "phone": "9876543211",
        "email": "sanya@example.com",
        "joining_date": datetime(2024, 2, 5, tzinfo=timezone.utc).date(),
    },
    {
        "staff_id": "STF-0003",
        "name": "Rahul Verma",
        "role": "Line Cook",
        "department": "Kitchen",
        "assigned_stall": "Main Square Stall",
        "shift": {"start_time": "10:00", "end_time": "18:00"},
        "status": "On Leave",
        "phone": "9876543212",
        "email": "rahul@example.com",
        "joining_date": datetime(2024, 3, 20, tzinfo=timezone.utc).date(),
    },
]


async def _generate_staff_id() -> str:
    counters_collection = get_collection("counters")
    counter = await counters_collection.find_one_and_update(
        {"_id": "staff_id"},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    sequence = int(counter.get("value", 1))
    return f"STF-{sequence:04d}"


def _build_identifier_query(identifier: str) -> dict:
    if ObjectId.is_valid(identifier):
        return {"$or": [{"_id": ObjectId(identifier)}, {"staff_id": identifier}]}
    return {"staff_id": identifier}


async def _get_staff_document_or_404(identifier: str) -> dict:
    staff_collection = get_collection("staff")
    document = await staff_collection.find_one(_build_identifier_query(identifier))
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff record not found")
    return document


async def add_staff(payload: StaffCreate) -> dict:
    staff_collection = get_collection("staff")
    email = payload.email.strip().lower()

    existing = await staff_collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Staff email already exists")

    staff_id = await _generate_staff_id()
    document = build_staff_document(payload.model_dump(), staff_id=staff_id)
    result = await staff_collection.insert_one(document)

    created = await staff_collection.find_one({"_id": result.inserted_id})
    return serialize_staff(created)


async def get_staff_list(role: str | None = None, status_value: str | None = None, search: str | None = None) -> list[dict]:
    staff_collection = get_collection("staff")
    filters: dict = {}

    if role:
        filters["role"] = {"$regex": f"^{re.escape(role)}$", "$options": "i"}

    if status_value:
        filters["status"] = {"$regex": f"^{re.escape(status_value)}$", "$options": "i"}

    if search:
        filters["name"] = {"$regex": re.escape(search.strip()), "$options": "i"}

    cursor = staff_collection.find(filters).sort("created_at", -1)
    return [serialize_staff(document) async for document in cursor]


async def get_staff_by_identifier(identifier: str) -> dict:
    document = await _get_staff_document_or_404(identifier)
    return serialize_staff(document)


async def update_staff(identifier: str, payload: StaffUpdate) -> dict:
    staff_collection = get_collection("staff")
    current_document = await _get_staff_document_or_404(identifier)

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields were provided to update")

    if "email" in update_data:
        new_email = str(update_data["email"]).strip().lower()
        existing = await staff_collection.find_one(
            {
                "email": new_email,
                "_id": {"$ne": current_document["_id"]},
            }
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Staff email already exists")
        update_data["email"] = new_email

    update_data["updated_at"] = datetime.now(timezone.utc)

    await staff_collection.update_one({"_id": current_document["_id"]}, {"$set": update_data})
    updated = await staff_collection.find_one({"_id": current_document["_id"]})

    return serialize_staff(updated)


async def delete_staff(identifier: str) -> None:
    staff_collection = get_collection("staff")
    document = await _get_staff_document_or_404(identifier)
    await staff_collection.delete_one({"_id": document["_id"]})


async def get_dashboard_metrics() -> dict:
    staff_collection = get_collection("staff")

    total_staff = await staff_collection.count_documents({})
    active_on_shift = await staff_collection.count_documents({"is_clocked_in": True, "status": "Active"})
    on_leave = await staff_collection.count_documents({"status": "On Leave"})
    pending_onboarding = await staff_collection.count_documents({"status": "Pending Onboarding"})

    return {
        "total_staff": total_staff,
        "active_on_shift": active_on_shift,
        "on_leave": on_leave,
        "pending_onboarding": pending_onboarding,
    }


async def get_active_staff() -> list[dict]:
    staff_collection = get_collection("staff")
    cursor = staff_collection.find({"is_clocked_in": True}).sort("updated_at", -1)
    return [serialize_staff(document) async for document in cursor]


async def clock_in_staff(identifier: str) -> dict:
    staff_collection = get_collection("staff")
    document = await _get_staff_document_or_404(identifier)

    if document.get("is_clocked_in"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff member is already clocked in")

    now = datetime.now(timezone.utc)
    await staff_collection.update_one(
        {"_id": document["_id"]},
        {
            "$set": {
                "is_clocked_in": True,
                "last_clock_in": now,
                "status": "Active",
                "updated_at": now,
            }
        },
    )

    updated = await staff_collection.find_one({"_id": document["_id"]})
    return serialize_staff(updated)


async def clock_out_staff(identifier: str) -> dict:
    staff_collection = get_collection("staff")
    document = await _get_staff_document_or_404(identifier)

    if not document.get("is_clocked_in"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff member is not clocked in")

    now = datetime.now(timezone.utc)
    last_clock_in = document.get("last_clock_in")

    worked_increment = 0
    if isinstance(last_clock_in, datetime):
        worked_increment = max(0, int((now - last_clock_in).total_seconds() // 60))

    worked_minutes = int(document.get("worked_minutes", 0)) + worked_increment

    await staff_collection.update_one(
        {"_id": document["_id"]},
        {
            "$set": {
                "is_clocked_in": False,
                "last_clock_out": now,
                "worked_minutes": worked_minutes,
                "status": "Off Duty",
                "updated_at": now,
            }
        },
    )

    updated = await staff_collection.find_one({"_id": document["_id"]})
    return serialize_staff(updated)


async def update_staff_status(identifier: str, payload: StaffStatusUpdate) -> dict:
    staff_collection = get_collection("staff")
    document = await _get_staff_document_or_404(identifier)

    await staff_collection.update_one(
        {"_id": document["_id"]},
        {
            "$set": {
                "status": payload.status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    updated = await staff_collection.find_one({"_id": document["_id"]})
    return serialize_staff(updated)


async def seed_sample_staff_data() -> None:
    staff_collection = get_collection("staff")

    existing_count = await staff_collection.count_documents({})
    if existing_count > 0:
        return

    now = datetime.now(timezone.utc)
    documents = []
    for sample in SAMPLE_STAFF:
        documents.append(
            {
                **sample,
                "email": sample["email"].lower(),
                "is_clocked_in": sample["status"] == "Active",
                "last_clock_in": now if sample["status"] == "Active" else None,
                "last_clock_out": None,
                "worked_minutes": 0,
                "created_at": now,
                "updated_at": now,
            }
        )

    await staff_collection.insert_many(documents)

    counters_collection = get_collection("counters")
    await counters_collection.update_one(
        {"_id": "staff_id"},
        {"$max": {"value": len(documents)}},
        upsert=True,
    )
