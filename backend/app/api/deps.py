"""FastAPI dependency: extract and validate the current user from Bearer token."""
from __future__ import annotations

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import get_current_user


async def get_token(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid Authorization header.")
    return authorization.removeprefix("Bearer ").strip()


async def current_user_dep(
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await get_current_user(db, token)
