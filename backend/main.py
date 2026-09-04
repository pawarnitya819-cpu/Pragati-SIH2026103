"""
PRAGATI Backend — AI-Powered Unified Web Platform for Infrastructure Project Monitoring
SIH26103 | Ministry of Statistics and Programme Implementation (MoSPI)

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""
import io
import os
import secrets
import time
import uuid
from typing import List, Optional
import string
import random

import pandas as pd
import bcrypt
from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import USE_DATABASE, engine
from sqlalchemy import inspect, Column, String, DateTime, Boolean, create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timedelta

app = FastAPI(
    title="PRAGATI API",
    description="Unified Infrastructure Project Monitoring backend for SIH26103 (MoSPI)",
    version="0.1.0",
)

# --- CORS -------------------------------------------------------------
_default_origins = "http://localhost:5173,http://localhost:3000"
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("FRONTEND_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# --- User Database Setup (SQLAlchemy ORM) -----
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    password_hash = Column(String)
    project_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_verified = Column(Boolean, default=False)

class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables if using database
if USE_DATABASE:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[DB] Could not create user tables: {e}")

# In-memory fallback for users (when no database)
_USERS_MEMORY = {}  # {email: {password_hash, project_id, is_verified}}
_PASSWORD_RESETS = {}  # {token: {email, expires_at}}

# --- Auth ---------------------------------------------------------------
UPLOAD_ACCESS_PASSWORD = os.environ.get("UPLOAD_ACCESS_PASSWORD", "change-me-in-render-env")
TOKEN_TTL_SECONDS = 4 * 60 * 60  # 4 hours

_ACTIVE_TOKENS: dict[str, float] = {}


def _issue_token() -> str:
    token = secrets.token_urlsafe(32)
    _ACTIVE_TOKENS[token] = time.time() + TOKEN_TTL_SECONDS
    return token


def _hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()


def _verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def _generate_reset_token() -> str:
    """Generate a secure password reset token."""
    return secrets.token_urlsafe(32)


def _get_user(email: str) -> Optional[dict]:
    """Get user from database or memory."""
    if USE_DATABASE:
        try:
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            user = session.query(User).filter(User.email == email).first()
            session.close()
            if user:
                return {
                    "email": user.email,
                    "password_hash": user.password_hash,
                    "project_id": user.project_id,
                    "is_verified": user.is_verified,
                }
        except Exception as e:
            print(f"[DB] Error fetching user: {e}")
    return _USERS_MEMORY.get(email)


def _create_user(email: str, password_hash: str, project_id: str) -> None:
    """Create a new user in database or memory."""
    if USE_DATABASE:
        try:
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            user = User(email=email, password_hash=password_hash, project_id=project_id, is_verified=True)
            session.add(user)
            session.commit()
            session.close()
        except Exception as e:
            print(f"[DB] Error creating user: {e}")
    _USERS_MEMORY[email] = {"password_hash": password_hash, "project_id": project_id, "is_verified": True}


def _update_password(email: str, new_password_hash: str) -> None:
    """Update user password in database or memory."""
    if USE_DATABASE:
        try:
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            user = session.query(User).filter(User.email == email).first()
            if user:
                user.password_hash = new_password_hash
                session.commit()
            session.close()
        except Exception as e:
            print(f"[DB] Error updating password: {e}")
    if email in _USERS_MEMORY:
        _USERS_MEMORY[email]["password_hash"] = new_password_hash


def _create_password_reset(email: str) -> str:
    """Create a password reset token valid for 30 minutes."""
    reset_token = _generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(minutes=30)

    if USE_DATABASE:
        try:
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            reset = PasswordReset(
                id=str(uuid.uuid4()),
                email=email,
                token=reset_token,
                expires_at=expires_at,
            )
            session.add(reset)
            session.commit()
            session.close()
        except Exception as e:
            print(f"[DB] Error creating password reset: {e}")

    _PASSWORD_RESETS[reset_token] = {"email": email, "expires_at": expires_at}
    return reset_token


def _verify_reset_token(reset_token: str) -> Optional[str]:
    """Verify a password reset token and return email if valid."""
    if USE_DATABASE:
        try:
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            reset = session.query(PasswordReset).filter(PasswordReset.token == reset_token).first()
            session.close()
            if reset and reset.expires_at > datetime.utcnow():
                return reset.email
        except Exception as e:
            print(f"[DB] Error verifying reset token: {e}")
        return None

    reset = _PASSWORD_RESETS.get(reset_token)
    if reset and reset["expires_at"] > datetime.utcnow():
        return reset["email"]
    return None


def _consume_reset_token(reset_token: str) -> None:
    """Delete a password reset token after use."""
    if USE_DATABASE:
        try:
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            session.query(PasswordReset).filter(PasswordReset.token == reset_token).delete()
            session.commit()
            session.close()
        except Exception as e:
            print(f"[DB] Error consuming reset token: {e}")
    _PASSWORD_RESETS.pop(reset_token, None)


def require_upload_auth(authorization: Optional[str] = Header(None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")
    token = authorization.removeprefix("Bearer ").strip()
    expiry = _ACTIVE_TOKENS.get(token)
    if expiry is None or expiry < time.time():
        _ACTIVE_TOKENS.pop(token, None)
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please verify access again.")


class AuthRequest(BaseModel):
    project_id: str
    password: str


class AuthResponse(BaseModel):
    token: str
    expires_in: int


class RegisterRequest(BaseModel):
    email: str
    password: str
    project_id: str


class RegisterResponse(BaseModel):
    message: str
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    message: str
    token: str
    expires_in: int


class Project(BaseModel):
    id: str
    name: str
    ministry: str
    sector: str
    state: str
    budget_cr: float
    budget_utilized_cr: float
    physical_progress_pct: float
    schedule_progress_pct: float
    delay_months: float
    risk_score: float
    risk_status: str
    milestones_total: int
    milestones_completed: int


def compute_risk(
    budget_cr: float,
    budget_utilized_cr: float,
    physical_progress_pct: float,
    schedule_progress_pct: float,
    delay_months: float,
) -> tuple[float, str]:
    budget_utilized_pct = (budget_utilized_cr / budget_cr * 100) if budget_cr else 0
    cost_variance = budget_utilized_pct - physical_progress_pct
    schedule_variance = schedule_progress_pct - physical_progress_pct
    delay_penalty = min(delay_months * 6, 40)

    raw_score = (
        max(cost_variance, 0) * 0.6
        + max(schedule_variance, 0) * 0.6
        + delay_penalty
    )

    risk_score = round(min(max(raw_score, 0), 100), 1)

    if risk_score < 25:
        status = "On Track"
    elif risk_score < 55:
        status = "Moderate Risk"
    else:
        status = "Critical Risk"

    return risk_score, status


REQUIRED_COLUMNS = {
    "name", "ministry", "sector", "state", "budget_cr", "budget_utilized_cr",
    "physical_progress_pct", "schedule_progress_pct", "delay_months",
    "milestones_total", "milestones_completed",
}


def _dedupe_key(name: str, ministry: str, state: str) -> str:
    """Two rows describe the same physical project when name + nodal ministry +
    location (state) match, ignoring case and surrounding / repeated whitespace.
    Repeated uploads of overlapping datasets had grown the register to 218 rows
    of which ~99 were duplicates."""
    return " || ".join(
        " ".join(str(part).split()).lower() for part in (name, ministry, state)
    )


def _dedupe_projects(projects: List[Project]) -> List[Project]:
    seen = set()
    unique = []
    for project in projects:
        key = _dedupe_key(project.name, project.ministry, project.state)
        if key in seen:
            continue
        seen.add(key)
        unique.append(project)
    return unique


def _build_seed() -> List[Project]:
    raw = [
        dict(name="National Highway Expansion (NH-44)", ministry="Ministry of Road Transport & Highways",
             sector="Roads", state="Punjab", budget_cr=1250, budget_utilized_cr=760,
             physical_progress_pct=64, schedule_progress_pct=62, delay_months=0.5,
             milestones_total=12, milestones_completed=8),
        dict(name="Eastern Dedicated Freight Corridor", ministry="Ministry of Railways",
             sector="Railways", state="Uttar Pradesh", budget_cr=4500, budget_utilized_cr=3400,
             physical_progress_pct=58, schedule_progress_pct=78, delay_months=3,
             milestones_total=20, milestones_completed=10),
        dict(name="Rural Electrification Phase IV", ministry="Ministry of Power",
             sector="Power", state="Bihar", budget_cr=850, budget_utilized_cr=470,
             physical_progress_pct=55, schedule_progress_pct=53, delay_months=0.2,
             milestones_total=10, milestones_completed=6),
        dict(name="Smart City Water Grid", ministry="Ministry of Housing & Urban Affairs",
             sector="Urban Infrastructure", state="Madhya Pradesh", budget_cr=420, budget_utilized_cr=310,
             physical_progress_pct=48, schedule_progress_pct=60, delay_months=1.5,
             milestones_total=8, milestones_completed=3),
        dict(name="Metro Rail Line Extension", ministry="Ministry of Urban Infrastructure",
             sector="Railways", state="Maharashtra", budget_cr=2100, budget_utilized_cr=1700,
             physical_progress_pct=46, schedule_progress_pct=72, delay_months=4,
             milestones_total=15, milestones_completed=6),
        dict(name="Bharatmala Pariyojana — Package 12", ministry="Ministry of Road Transport & Highways",
             sector="Roads", state="Rajasthan", budget_cr=980, budget_utilized_cr=540,
             physical_progress_pct=57, schedule_progress_pct=55, delay_months=0.3,
             milestones_total=10, milestones_completed=6),
        dict(name="Inland Waterway Terminal — Varanasi", ministry="Ministry of Ports, Shipping & Waterways",
             sector="Waterways", state="Uttar Pradesh", budget_cr=340, budget_utilized_cr=150,
             physical_progress_pct=40, schedule_progress_pct=41, delay_months=0.1,
             milestones_total=6, milestones_completed=2),
        dict(name="Ultra Mega Solar Power Park", ministry="Ministry of New & Renewable Energy",
             sector="Power", state="Gujarat", budget_cr=1600, budget_utilized_cr=980,
             physical_progress_pct=63, schedule_progress_pct=68, delay_months=1,
             milestones_total=9, milestones_completed=6),
        dict(name="Ahmedabad Metro Phase 2", ministry="Ministry of Urban Infrastructure",
             sector="Railways", state="Gujarat", budget_cr=3200, budget_utilized_cr=1500,
             physical_progress_pct=40, schedule_progress_pct=42, delay_months=0.4,
             milestones_total=16, milestones_completed=6),
        dict(name="Kandla Port Expansion", ministry="Ministry of Ports, Shipping & Waterways",
             sector="Waterways", state="Gujarat", budget_cr=1100, budget_utilized_cr=900,
             physical_progress_pct=55, schedule_progress_pct=78, delay_months=3.2,
             milestones_total=10, milestones_completed=5),
        dict(name="Gujarat Rural Roads Package", ministry="Ministry of Road Transport & Highways",
             sector="Roads", state="Gujarat", budget_cr=560, budget_utilized_cr=300,
             physical_progress_pct=53, schedule_progress_pct=51, delay_months=0.2,
             milestones_total=8, milestones_completed=4),
        dict(name="Surat Smart City Sewage Network", ministry="Ministry of Housing & Urban Affairs",
             sector="Urban Infrastructure", state="Gujarat", budget_cr=380, budget_utilized_cr=290,
             physical_progress_pct=44, schedule_progress_pct=62, delay_months=2.1,
             milestones_total=7, milestones_completed=3),
        dict(name="Statue of Unity Connectivity Corridor", ministry="Ministry of Road Transport & Highways",
             sector="Roads", state="Gujarat", budget_cr=720, budget_utilized_cr=400,
             physical_progress_pct=60, schedule_progress_pct=58, delay_months=0.3,
             milestones_total=9, milestones_completed=6),
        dict(name="Delhi-Mumbai Expressway Package 7", ministry="Ministry of Road Transport & Highways",
             sector="Roads", state="Haryana", budget_cr=2200, budget_utilized_cr=1900,
             physical_progress_pct=50, schedule_progress_pct=82, delay_months=5,
             milestones_total=14, milestones_completed=6),
        dict(name="Chennai Desalination Plant", ministry="Ministry of Jal Shakti",
             sector="Water Infrastructure", state="Tamil Nadu", budget_cr=480, budget_utilized_cr=260,
             physical_progress_pct=56, schedule_progress_pct=54, delay_months=0.2,
             milestones_total=7, milestones_completed=4),
        dict(name="Assam Gas Cracker Pipeline", ministry="Ministry of Petroleum & Natural Gas",
             sector="Power", state="Assam", budget_cr=900, budget_utilized_cr=700,
             physical_progress_pct=50, schedule_progress_pct=68, delay_months=2.5,
             milestones_total=10, milestones_completed=4),
        dict(name="Kerala Coastal Highway", ministry="Ministry of Road Transport & Highways",
             sector="Roads", state="Kerala", budget_cr=640, budget_utilized_cr=350,
             physical_progress_pct=55, schedule_progress_pct=53, delay_months=0.1,
             milestones_total=8, milestones_completed=5),
        dict(name="Andhra Pradesh Capital Region Metro", ministry="Ministry of Urban Infrastructure",
             sector="Railways", state="Andhra Pradesh", budget_cr=1450, budget_utilized_cr=1100,
             physical_progress_pct=48, schedule_progress_pct=70, delay_months=2.8,
             milestones_total=12, milestones_completed=5),
        dict(name="Himachal Hydropower Project", ministry="Ministry of Power",
             sector="Power", state="Himachal Pradesh", budget_cr=780, budget_utilized_cr=520,
             physical_progress_pct=58, schedule_progress_pct=60, delay_months=0.8,
             milestones_total=9, milestones_completed=5),
        dict(name="Northeast Gas Grid", ministry="Ministry of Petroleum & Natural Gas",
             sector="Power", state="Tripura", budget_cr=500, budget_utilized_cr=260,
             physical_progress_pct=52, schedule_progress_pct=50, delay_months=0.2,
             milestones_total=7, milestones_completed=4),
    ]

    projects = []
    for r in raw:
        score, status = compute_risk(
            r["budget_cr"], r["budget_utilized_cr"],
            r["physical_progress_pct"], r["schedule_progress_pct"], r["delay_months"],
        )
        projects.append(Project(
            id=str(uuid.uuid4()),
            risk_score=score,
            risk_status=status,
            **r,
        ))
    return projects


DB_TABLE = "projects"


def _row_to_project(row: dict) -> Project:
    score, status = compute_risk(
        float(row["budget_cr"]), float(row["budget_utilized_cr"]),
        float(row["physical_progress_pct"]), float(row["schedule_progress_pct"]),
        float(row["delay_months"]),
    )
    return Project(
        id=str(row.get("id") or uuid.uuid4()),
        name=str(row["name"]),
        ministry=str(row["ministry"]),
        sector=str(row["sector"]),
        state=str(row["state"]),
        budget_cr=float(row["budget_cr"]),
        budget_utilized_cr=float(row["budget_utilized_cr"]),
        physical_progress_pct=float(row["physical_progress_pct"]),
        schedule_progress_pct=float(row["schedule_progress_pct"]),
        delay_months=float(row["delay_months"]),
        risk_score=score,
        risk_status=status,
        milestones_total=int(row["milestones_total"]),
        milestones_completed=int(row["milestones_completed"]),
    )


def _load_projects_from_db() -> List[Project]:
    df = pd.read_sql_table(DB_TABLE, engine)
    return _dedupe_projects(
        [_row_to_project(row) for row in df.to_dict(orient="records")]
    )


def _save_new_rows_to_db(df: pd.DataFrame) -> None:
    keep_cols = [c for c in REQUIRED_COLUMNS if c in df.columns]
    df[keep_cols].to_sql(DB_TABLE, engine, if_exists="append", index=False)


def _init_db() -> List[Project]:
    if USE_DATABASE:
        table_exists = inspect(engine).has_table(DB_TABLE)
        if not table_exists:
            seed_projects = _build_seed()
            seed_df = pd.DataFrame([p.model_dump() for p in seed_projects])
            seed_df = seed_df.drop(columns=["id", "risk_score", "risk_status"])
            seed_df.to_sql(DB_TABLE, engine, if_exists="replace", index=False)
            return seed_projects
        try:
            return _load_projects_from_db()
        except Exception:
            return _build_seed()
    return _build_seed()


DB: List[Project] = _init_db()


def _dataframe_to_projects(df: pd.DataFrame) -> List[Project]:
    missing = REQUIRED_COLUMNS - set(c.strip() for c in df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file is missing required column(s): {', '.join(sorted(missing))}",
        )

    new_projects = []
    for _, row in df.iterrows():
        try:
            budget_cr = float(row["budget_cr"])
            budget_utilized_cr = float(row["budget_utilized_cr"])
            physical_progress_pct = float(row["physical_progress_pct"])
            schedule_progress_pct = float(row["schedule_progress_pct"])
            delay_months = float(row["delay_months"])
            milestones_total = int(row["milestones_total"])
            milestones_completed = int(row["milestones_completed"])
        except (ValueError, TypeError):
            continue

        score, status = compute_risk(
            budget_cr, budget_utilized_cr, physical_progress_pct,
            schedule_progress_pct, delay_months,
        )

        new_projects.append(Project(
            id=str(uuid.uuid4()),
            name=str(row["name"]),
            ministry=str(row["ministry"]),
            sector=str(row["sector"]),
            state=str(row["state"]),
            budget_cr=budget_cr,
            budget_utilized_cr=budget_utilized_cr,
            physical_progress_pct=physical_progress_pct,
            schedule_progress_pct=schedule_progress_pct,
            delay_months=delay_months,
            risk_score=score,
            risk_status=status,
            milestones_total=milestones_total,
            milestones_completed=milestones_completed,
        ))
    return new_projects


def _compute_kpis(projects: List[Project]) -> dict:
    total_projects = len(projects)
    total_budget = round(sum(p.budget_cr for p in projects), 1)
    high_risk = len([p for p in projects if p.risk_status == "Critical Risk"])
    moderate_risk = len([p for p in projects if p.risk_status == "Moderate Risk"])
    milestones_completed = sum(p.milestones_completed for p in projects)
    milestones_total = sum(p.milestones_total for p in projects)

    sector_budget = {}
    for p in projects:
        sector_budget[p.sector] = sector_budget.get(p.sector, 0) + p.budget_cr

    risk_breakdown = {
        "On Track": len([p for p in projects if p.risk_status == "On Track"]),
        "Moderate Risk": moderate_risk,
        "Critical Risk": high_risk,
    }

    return {
        "total_projects": total_projects,
        "total_budget_cr": total_budget,
        "high_risk_projects": high_risk,
        "milestones_completed": milestones_completed,
        "milestones_total": milestones_total,
        "sector_budget": sector_budget,
        "risk_breakdown": risk_breakdown,
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "PRAGATI API"}


@app.post("/api/auth/register", response_model=RegisterResponse)
def register_user(payload: RegisterRequest):
    """Register a new user for data uploads."""
    email = payload.email.strip().lower()
    password = payload.password.strip()
    project_id = payload.project_id.strip()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID is required.")

    # Check if user already exists
    if _get_user(email):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    # Hash password and create user
    password_hash = _hash_password(password)
    _create_user(email, password_hash, project_id)

    return RegisterResponse(message="Account created successfully. You can now log in.", email=email)


@app.post("/api/auth/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest):
    """Initiate password reset flow."""
    email = payload.email.strip().lower()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    # Check if user exists
    user = _get_user(email)
    if not user:
        # For security, don't reveal if email exists, but return a generic success
        return ForgotPasswordResponse(
            message="If an account exists with that email, a password reset link has been sent.",
            reset_token=""
        )

    # Create reset token
    reset_token = _create_password_reset(email)

    return ForgotPasswordResponse(
        message="Password reset link has been sent to your email. Token is valid for 30 minutes.",
        reset_token=reset_token  # In production, send this via email instead
    )


@app.post("/api/auth/reset-password", response_model=ResetPasswordResponse)
def reset_password(payload: ResetPasswordRequest):
    """Reset password using a valid reset token."""
    reset_token = payload.reset_token.strip()
    new_password = payload.new_password.strip()

    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    # Verify reset token
    email = _verify_reset_token(reset_token)
    if not email:
        raise HTTPException(status_code=401, detail="Reset token is invalid or expired.")

    # Update password
    new_password_hash = _hash_password(new_password)
    _update_password(email, new_password_hash)

    # Consume the reset token
    _consume_reset_token(reset_token)

    # Issue auth token for immediate login
    token = _issue_token()
    return ResetPasswordResponse(
        message="Password reset successful. You are now logged in.",
        token=token,
        expires_in=TOKEN_TTL_SECONDS
    )


@app.post("/api/auth/verify", response_model=AuthResponse)
def verify_access(payload: AuthRequest):
    """Login with email and password (updated to support both old and new auth)."""
    project_id = payload.project_id.strip()
    password = payload.password.strip()

    # Check if this is an email (new auth) or legacy project_id (old auth)
    if "@" in project_id:
        # New email-based login
        email = project_id.lower()
        user = _get_user(email)
        if not user or not _verify_password(password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
    else:
        # Legacy password-based login (backward compatibility)
        if not secrets.compare_digest(password, UPLOAD_ACCESS_PASSWORD):
            raise HTTPException(status_code=401, detail="Incorrect password.")

    token = _issue_token()
    return AuthResponse(token=token, expires_in=TOKEN_TTL_SECONDS)


@app.get("/api/projects", response_model=List[Project])
def get_projects(sector: Optional[str] = None, state: Optional[str] = None):
    results = DB
    if sector and sector != "All":
        results = [p for p in results if p.sector == sector]
    if state and state != "All":
        results = [p for p in results if p.state == state]
    return results


@app.get("/api/kpis")
def get_kpis():
    return _compute_kpis(DB)


MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


@app.post("/api/upload", dependencies=[Depends(require_upload_auth)])
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename or ""
    content = await file.read()

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File is {len(content) / (1024*1024):.1f} MB — the limit is 10 MB.",
        )

    try:
        if filename.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Only .csv, .xlsx, or .xls files are supported.")
    except HTTPException:
        raise
    except Exception:
        print(f"[upload] failed to parse '{filename}'")
        raise HTTPException(status_code=400, detail="Could not parse file. Check that it's a valid CSV/Excel file with the expected columns.")
    new_projects = _dataframe_to_projects(df)
    if not new_projects:
        raise HTTPException(status_code=400, detail="No valid project rows found in the uploaded file.")

    if USE_DATABASE:
        _save_new_rows_to_db(df)
        global DB
        DB = _load_projects_from_db()
    else:
        DB.extend(new_projects)
        DB = _dedupe_projects(DB)

    return {
        "message": f"Processed and synced {len(new_projects)} project record(s).",
        "added": new_projects,
        "projects": DB,
        "kpis": _compute_kpis(DB),
    }


@app.post("/api/dedupe", dependencies=[Depends(require_upload_auth)])
def dedupe_dataset():
    """Physically collapse duplicate rows (same name + ministry + state) in the
    store, keeping the first occurrence. Returns how many rows were removed so a
    one-off cleanup of the live register can be confirmed."""
    global DB
    before = len(DB)
    DB = _dedupe_projects(DB)
    removed = before - len(DB)

    if USE_DATABASE and removed:
        # Rewrite the table from the de-duplicated set.
        clean_df = pd.DataFrame([p.model_dump() for p in DB])
        clean_df = clean_df.drop(columns=["id", "risk_score", "risk_status"])
        clean_df.to_sql(DB_TABLE, engine, if_exists="replace", index=False)
        DB = _load_projects_from_db()

    return {
        "message": f"Removed {removed} duplicate record(s).",
        "records_before": before,
        "records_after": len(DB),
        "projects": DB,
        "kpis": _compute_kpis(DB),
    }

@app.delete("/api/reset", dependencies=[Depends(require_upload_auth)])
def reset_dataset():
    """Reset the store back to the original seed dataset (demo convenience)."""
    global DB
    if USE_DATABASE:
        seed_projects = _build_seed()
        seed_df = pd.DataFrame([p.model_dump() for p in seed_projects])
        seed_df = seed_df.drop(columns=["id", "risk_score", "risk_status"])
        seed_df.to_sql(DB_TABLE, engine, if_exists="replace", index=False)
        DB = _load_projects_from_db()
    else:
        DB = _build_seed()
    return {"message": "Dataset reset to seed data.", "projects": DB, "kpis": _compute_kpis(DB)}