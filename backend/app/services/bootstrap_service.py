from __future__ import annotations

from app.database import get_collection
from app.services.auth_service import seed_default_users
from app.services.staff_service import seed_sample_staff_data


async def ensure_indexes() -> None:
    staff_collection = get_collection("staff")
    users_collection = get_collection("users")

    await staff_collection.create_index("staff_id", unique=True)
    await staff_collection.create_index("email", unique=True)
    await staff_collection.create_index("name")
    await staff_collection.create_index("role")
    await staff_collection.create_index("status")
    await staff_collection.create_index("is_clocked_in")

    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("role")


async def seed_initial_data() -> None:
    await seed_default_users()
    await seed_sample_staff_data()
