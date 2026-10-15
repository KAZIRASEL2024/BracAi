"""Doctor routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user_dep
from app.db.session import get_db
from app.models.user import User
from app.schemas.doctor import DoctorDetail, DoctorListResponse
from app.services import doctor_service

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=DoctorListResponse)
async def list_doctors(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user_dep),
) -> DoctorListResponse:
    return await doctor_service.list_doctors(db)


@router.get("/{doctor_id}", response_model=DoctorDetail)
async def get_doctor(
    doctor_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(current_user_dep),
) -> DoctorDetail:
    return await doctor_service.get_doctor(db, doctor_id)
