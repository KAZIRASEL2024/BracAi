"""Doctor list/detail service."""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models.consultation_response import ConsultationResponse
from app.models.doctor import Doctor
from app.models.doctor_zone_assignment import DoctorZoneAssignment
from app.models.user import User
from app.schemas.doctor import DoctorDetail, DoctorListItem, DoctorListResponse, ZoneBrief


def _build_list_item(doctor: Doctor, user: User, response_count: int) -> DoctorListItem:
    return DoctorListItem(
        id=doctor.id,
        user_id=doctor.user_id,
        full_name=user.full_name,
        email=user.email,
        registration_number=doctor.registration_number,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        phone=doctor.phone,
        is_emergency_doctor=doctor.is_emergency_doctor,
        is_available=doctor.is_available,
        zones=[
            ZoneBrief(id=a.zone.id, name=a.zone.name)
            for a in doctor.zone_assignments
            if a.zone
        ],
        total_responses=response_count,
    )


async def list_doctors(db: AsyncSession) -> DoctorListResponse:
    result = await db.execute(
        select(Doctor)
        .options(
            selectinload(Doctor.user),
            selectinload(Doctor.zone_assignments).selectinload(DoctorZoneAssignment.zone),
        )
    )
    doctors = result.scalars().all()

    items = []
    for doc in doctors:
        # Count responses
        cnt_result = await db.execute(
            select(func.count(ConsultationResponse.id)).where(
                ConsultationResponse.doctor_id == doc.id
            )
        )
        rc = cnt_result.scalar_one()
        items.append(_build_list_item(doc, doc.user, rc))

    return DoctorListResponse(items=items, total=len(items))


async def get_doctor(db: AsyncSession, doctor_id: int) -> DoctorDetail:
    result = await db.execute(
        select(Doctor)
        .where(Doctor.id == doctor_id)
        .options(
            selectinload(Doctor.user),
            selectinload(Doctor.zone_assignments).selectinload(DoctorZoneAssignment.zone),
        )
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise NotFoundError(f"Doctor {doctor_id} not found.")

    cnt_result = await db.execute(
        select(func.count(ConsultationResponse.id)).where(
            ConsultationResponse.doctor_id == doctor_id
        )
    )
    rc = cnt_result.scalar_one()

    base = _build_list_item(doc, doc.user, rc)
    return DoctorDetail(**base.model_dump(), bio=doc.bio, avatar_url=doc.avatar_url)
