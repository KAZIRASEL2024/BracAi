# BRAC AISP — Doctor Management System

A web-based dashboard for veterinary doctors to review animal health consultations submitted by BRAC AISP field workers and provide clinical feedback.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Prerequisites (Windows)](#prerequisites-windows)
5. [Quick Start](#quick-start)
6. [Environment Variables](#environment-variables)
7. [Docker Compose Commands](#docker-compose-commands)
8. [Database Migrations & Seeding](#database-migrations--seeding)
9. [URLs](#urls)
10. [Demo Login](#demo-login)
11. [Running Tests](#running-tests)
12. [Known Limitations & Future Integrations](#known-limitations--future-integrations)

---

## Overview

BRAC AISP field workers submit animal health consultations via the existing AISP mobile application. This Doctor Management System provides a separate web dashboard where assigned veterinary doctors can:

- View incoming consultation cases with symptoms, vitals, and attachments
- Submit clinical diagnoses and treatment plans
- Track consultation status and SLA deadlines
- Receive notifications for new and overdue cases
- Access doctor profiles and geographic zone assignments

> **Demo notice**: This system currently uses sample data. The real AISP mobile backend integration is isolated behind a dedicated client interface (`backend/app/integrations/aisp_client.py`) and will be connected once the API contract is confirmed.

---

## Architecture

```
Browser (Next.js :3000)
        │
        │  HTTP REST API (JSON)
        ▼
FastAPI Backend (:8000)
        │
        │  SQLAlchemy 2.x + psycopg
        ▼
PostgreSQL Database (:5432)
```

```
doctor-management-system/
├── frontend/        Next.js 15 + TypeScript
├── backend/         FastAPI + Python 3.12
├── database/        PostgreSQL init SQL
├── scripts/         PowerShell dev scripts
└── docs/            Architecture & integration docs
```

---

## Technology Stack

| Layer        | Technology                            |
|-------------|----------------------------------------|
| Frontend     | Next.js 15, TypeScript, Vanilla CSS   |
| Backend      | FastAPI, Python 3.12, Uvicorn         |
| Database     | PostgreSQL 16                          |
| ORM          | SQLAlchemy 2.x (async)                |
| Migrations   | Alembic                                |
| DB Driver    | Psycopg 3                              |
| Auth         | JWT (python-jose) + bcrypt (passlib)  |
| Containers   | Docker + Docker Compose               |

---

## Prerequisites (Windows)

1. **Docker Desktop** (includes Docker Compose)  
   → https://www.docker.com/products/docker-desktop/  
   Enable WSL 2 backend when prompted.

2. **Git** → https://git-scm.com/download/win

3. **PowerShell 7+** (optional but recommended)  
   → https://github.com/PowerShell/PowerShell/releases

> Node.js and Python are **not** required on your host machine — everything runs inside Docker.

---

## Quick Start

```powershell
# 1. Clone the repository
git clone <your-repo-url> doctor-management-system
cd doctor-management-system

# 2. Copy environment file (edit passwords if needed)
Copy-Item .env.example .env

# 3. Start the full stack (builds images on first run)
.\scripts\dev-up.ps1 -Build

# 4. Open the dashboard
Start-Process "http://localhost:3000"
```

Or using the Makefile (requires `make` via Chocolatey or Git Bash):

```bash
make up
```

---

## Environment Variables

### Root `.env` (used by Docker Compose)

| Variable                      | Default                      | Description                          |
|------------------------------|------------------------------|--------------------------------------|
| `POSTGRES_DB`                | `doctor_management`          | PostgreSQL database name             |
| `POSTGRES_USER`              | `dms_user`                   | PostgreSQL username                  |
| `POSTGRES_PASSWORD`          | `change_me_in_production`    | **Change before production!**        |
| `DATABASE_URL`               | (psycopg connection string)  | Full async DB URL for backend        |
| `SECRET_KEY`                 | `dev_secret_key_...`         | JWT signing key — **must be changed**|
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `60`                         | JWT token lifetime                   |
| `BACKEND_CORS_ORIGINS`       | `http://localhost:3000`      | Allowed CORS origins                 |
| `NEXT_PUBLIC_API_BASE_URL`   | `http://localhost:8000`      | Frontend → Backend URL               |
| `SEED_DEMO_DATA`             | `true`                       | Seed demo data on startup            |

---

## Docker Compose Commands

```powershell
# Start (detached)
.\scripts\dev-up.ps1

# Start with rebuild
.\scripts\dev-up.ps1 -Build

# Stop
.\scripts\dev-down.ps1

# Wipe database and restart with fresh demo data
.\scripts\reset-demo.ps1

# View logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# View only backend logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
```

---

## Database Migrations & Seeding

Migrations run **automatically** on container startup via the `CMD` in `backend/Dockerfile`:

```
alembic upgrade head && uvicorn app.main:app ...
```

To run migrations manually:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend alembic upgrade head
```

To create a new migration after changing models:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend `
    alembic revision --autogenerate -m "describe_your_change"
```

To re-seed demo data manually:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend `
    python -m scripts.seed_demo_data
```

---

## URLs

| Service      | URL                              |
|-------------|----------------------------------|
| Dashboard    | http://localhost:3000            |
| API Root     | http://localhost:8000/api        |
| Swagger UI   | http://localhost:8000/api/docs   |
| ReDoc        | http://localhost:8000/api/redoc  |
| Health Check | http://localhost:8000/api/health |

---

## Demo Login

> All credentials are fictional and for demonstration only.

| Role    | Email                          | Password      |
|--------|-------------------------------|---------------|
| Admin   | admin@brac-aisp.org           | `Admin@1234`  |
| Doctor  | dr.rahman@brac-aisp.org       | `Doctor@1234` |
| Doctor  | dr.begum@brac-aisp.org        | `Doctor@1234` |
| Doctor  | dr.hossain@brac-aisp.org      | `Doctor@1234` |
| Doctor  | dr.chowdhury@brac-aisp.org    | `Doctor@1234` |

---

## Running Tests

```powershell
# Run all backend tests via Docker
.\scripts\test.ps1

# Or manually inside the backend container
docker compose exec backend pytest tests/ -v
```

Tests use an in-memory SQLite database and do not require a running PostgreSQL instance.

---

## Known Limitations & Future Integrations

### Demo / Mock Data
- All consultations, doctors, and zones are fictional sample data
- File attachments point to placeholder paths — no real files are stored
- Notifications are static and not pushed in real time

### Not Yet Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| AISP mobile API integration | 🔲 Planned | Client stub in `backend/app/integrations/aisp_client.py` |
| BRAC ERP region sync | 🔲 Planned | ERP codes stored in `zones.erp_region_code`; sync client in `erp_client.py` |
| Real file upload/download | 🔲 Planned | Storage client in `storage_client.py`; currently demo paths only |
| WebSocket notifications | 🔲 Planned | Currently polling-based |
| SLA background monitor | 🔲 Planned | Stub in `backend/app/tasks/sla_monitor.py` |
| Emergency routing | 🔲 Planned | `routing_service.py` stub ready |
| 2FA / audit log viewer | 🔲 Planned | Audit log model exists |

### Connecting the Real AISP API

When the AISP API documentation becomes available:

1. Implement the adapter in `backend/app/integrations/aisp_client.py`
2. Replace mock consultation seeding with live API calls
3. Map AISP external IDs to `consultations.aisp_reference`
4. Deliver doctor responses back to AISP via the adapter
5. Update `docs/integration-with-existing-aisp.md` with the confirmed contract

> The dashboard, service layer, and database schema do **not** need to change for the integration — only the adapter.

### Production Hardening (before go-live)
- Change all passwords and `SECRET_KEY` in `.env`
- Set `BACKEND_CORS_ORIGINS` to the production frontend domain only
- Do not expose PostgreSQL port (`5432`) publicly
- Enable HTTPS via a reverse proxy (nginx / Caddy)
- Set `SEED_DEMO_DATA=false`
