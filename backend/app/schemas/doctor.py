"""Doctor schemas."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class ZoneBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class DoctorListItem(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    registration_number: str
    specialization: str
    qualification: str
    phone: str
    is_emergency_doctor: bool
    is_available: bool
    zones: List[ZoneBrief] = []
    total_responses: int = 0

    model_config = {"from_attributes": True}


class DoctorDetail(DoctorListItem):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class DoctorListResponse(BaseModel):
    items: List[DoctorListItem]
    total: int
