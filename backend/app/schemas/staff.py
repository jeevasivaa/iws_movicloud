from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

TIME_PATTERN = r"^([01]\\d|2[0-3]):([0-5]\\d)$"
PHONE_PATTERN = r"^\\+?[0-9]{10,15}$"


class StaffStatus(str, Enum):
    ACTIVE = "Active"
    OFF_DUTY = "Off Duty"
    ON_LEAVE = "On Leave"
    PENDING_ONBOARDING = "Pending Onboarding"


class ShiftWindow(BaseModel):
    start_time: str = Field(pattern=TIME_PATTERN, examples=["06:00"])
    end_time: str = Field(pattern=TIME_PATTERN, examples=["14:00"])


class StaffBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=50)
    department: str = Field(min_length=2, max_length=50)
    assigned_stall: str = Field(min_length=2, max_length=100)
    shift: ShiftWindow
    status: StaffStatus = StaffStatus.PENDING_ONBOARDING
    phone: str = Field(pattern=PHONE_PATTERN)
    email: EmailStr
    joining_date: date


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    role: Optional[str] = Field(default=None, min_length=2, max_length=50)
    department: Optional[str] = Field(default=None, min_length=2, max_length=50)
    assigned_stall: Optional[str] = Field(default=None, min_length=2, max_length=100)
    shift: Optional[ShiftWindow] = None
    status: Optional[StaffStatus] = None
    phone: Optional[str] = Field(default=None, pattern=PHONE_PATTERN)
    email: Optional[EmailStr] = None
    joining_date: Optional[date] = None


class StaffStatusUpdate(BaseModel):
    status: Literal["Active", "Off Duty", "On Leave", "Pending Onboarding"]


class StaffOut(BaseModel):
    id: str
    staff_id: str
    name: str
    role: str
    department: str
    assigned_stall: str
    shift: ShiftWindow
    status: StaffStatus
    phone: str
    email: EmailStr
    joining_date: date
    is_clocked_in: bool
    last_clock_in: Optional[datetime] = None
    last_clock_out: Optional[datetime] = None
    worked_minutes: int
    created_at: datetime
    updated_at: datetime


class DashboardMetrics(BaseModel):
    total_staff: int
    active_on_shift: int
    on_leave: int
    pending_onboarding: int


class ClockResponse(BaseModel):
    staff_id: str
    status: StaffStatus
    is_clocked_in: bool
    last_clock_in: Optional[datetime] = None
    last_clock_out: Optional[datetime] = None
    worked_minutes: int
