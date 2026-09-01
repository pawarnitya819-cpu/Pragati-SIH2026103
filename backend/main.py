"""
PRAGATI Backend — AI-Powered Unified Web Platform for Infrastructure Project Monitoring
SIH26103 | Ministry of Statistics and Programme Implementation (MoSPI)

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

import io
import uuid
from typing import List, Optional

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import USE_DATABASE, engine

app = FastAPI(
    title="PRAGATI API",
    description="Unified Infrastructure Project Monitoring backend for SIH26103 (MoSPI)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
) -> (float, str):
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
        try:
            return _load_projects_from_db()
        except Exception:
            seed_projects = _build_seed()
            seed_df = pd.DataFrame([p.model_dump() for p in seed_projects])
            seed_df = seed_df.drop(columns=["id", "risk_score", "risk_status"])
            seed_df.to_sql(DB_TABLE, engine, if_exists="replace", index=False)
            return seed_projects
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


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename or ""
    content = await file.read()

    try:
        if filename.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Only .csv, .xlsx, or .xls files are supported.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {exc}")

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


@app.post("/api/dedupe")
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


@app.delete("/api/reset")
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