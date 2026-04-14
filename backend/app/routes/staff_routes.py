from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status

from app.schemas.staff import StaffCreate, StaffStatusUpdate, StaffUpdate
from app.services.staff_service import (
    add_staff,
    clock_in_staff,
    clock_out_staff,
    delete_staff,
    get_active_staff,
    get_dashboard_metrics,
    get_staff_by_identifier,
    get_staff_list,
    update_staff,
    update_staff_status,
)
from app.utils.dependencies import require_roles
from app.utils.responses import success_response

router = APIRouter(prefix="/api/staff", tags=["Staff"])


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_new_staff(payload: StaffCreate, _current_user: dict = Depends(require_roles("Admin"))):
    created = await add_staff(payload)
    return success_response("Staff member added successfully", created)


@router.get("/all")
async def list_staff(
    role: str | None = Query(default=None),
    status_value: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    _current_user: dict = Depends(require_roles("Admin", "Staff")),
):
    staff = await get_staff_list(role=role, status_value=status_value, search=search)
    return success_response("Staff list fetched successfully", staff)


@router.get("/dashboard")
async def staff_dashboard(_current_user: dict = Depends(require_roles("Admin", "Staff"))):
    metrics = await get_dashboard_metrics()
    return success_response("Dashboard metrics fetched successfully", metrics)


@router.get("/active")
async def active_staff(_current_user: dict = Depends(require_roles("Admin", "Staff"))):
    rows = await get_active_staff()
    return success_response("Active staff fetched successfully", rows)


@router.post("/clock-in/{identifier}")
async def clock_in(identifier: str, _current_user: dict = Depends(require_roles("Admin", "Staff"))):
    staff = await clock_in_staff(identifier)
    return success_response("Clock-in recorded successfully", staff)


@router.post("/clock-out/{identifier}")
async def clock_out(identifier: str, _current_user: dict = Depends(require_roles("Admin", "Staff"))):
    staff = await clock_out_staff(identifier)
    return success_response("Clock-out recorded successfully", staff)


@router.patch("/status/{identifier}")
async def set_staff_status(
    identifier: str,
    payload: StaffStatusUpdate,
    _current_user: dict = Depends(require_roles("Admin")),
):
    staff = await update_staff_status(identifier, payload)
    return success_response("Staff status updated successfully", staff)


@router.get("/{identifier}")
async def staff_detail(identifier: str, _current_user: dict = Depends(require_roles("Admin", "Staff"))):
    staff = await get_staff_by_identifier(identifier)
    return success_response("Staff member fetched successfully", staff)


@router.put("/update/{identifier}")
async def update_staff_details(
    identifier: str,
    payload: StaffUpdate,
    _current_user: dict = Depends(require_roles("Admin")),
):
    updated = await update_staff(identifier, payload)
    return success_response("Staff member updated successfully", updated)


@router.delete("/delete/{identifier}")
async def remove_staff(identifier: str, _current_user: dict = Depends(require_roles("Admin"))):
    await delete_staff(identifier)
    return success_response("Staff member deleted successfully")
