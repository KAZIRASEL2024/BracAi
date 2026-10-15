"""FastAPI application entry point."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import http_exception_handler
from app.core.logging import configure_logging, get_logger
from app.db.session import engine

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    configure_logging("DEBUG" if settings.ENVIRONMENT == "development" else "INFO")
    log.info("Starting BRAC AISP Doctor Management System", env=settings.ENVIRONMENT)

    if settings.SEED_DEMO_DATA:
        try:
            from scripts.seed_demo_data import seed  # type: ignore[import]
            from app.db.session import AsyncSessionLocal

            async with AsyncSessionLocal() as db:
                await seed(db)
            log.info("Demo data seeded successfully")
        except Exception as exc:
            log.warning("Demo data seeding skipped", reason=str(exc))

    yield
    log.info("Shutting down")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Doctor Management System for BRAC AISP — "
        "review animal health consultations and submit clinical feedback."
    ),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore[arg-type]

# Routes
app.include_router(api_router)
