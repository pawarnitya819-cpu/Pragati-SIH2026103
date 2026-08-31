# PRAGATI — Unified Infrastructure Project Monitoring
### Smart India Hackathon 2026 · Problem Statement SIH26103 · MoSPI

A prototype web platform for AI-assisted monitoring of central infrastructure
projects — budget utilisation, physical progress, and automated delay/overrun
risk scoring, across Roads, Railways, Power, Urban Infrastructure, and
Waterways sectors.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Recharts, Lucide icons |
| Backend | Python FastAPI, pandas (CSV/Excel parsing), Pydantic |
| Risk engine | Lightweight cost/schedule-variance heuristic (Python + mirrored JS) |

The frontend works standalone off pre-loaded sample data (8 realistic central
projects) even if the backend isn't running — useful for a quick demo. Start
the backend too for the full "upload → parse → live recalculation" flow.

---

## 1. Run the backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Interactive docs at
`http://localhost:8000/docs`.

Key endpoints:

- `GET  /api/projects` — list all monitored projects (supports `?sector=` & `?state=` filters)
- `GET  /api/kpis` — aggregated KPI summary (budget, risk breakdown, milestones)
- `POST /api/upload` — multipart file upload (`.csv` / `.xlsx` / `.xls`); parses, scores risk, merges into the dataset, returns updated projects + KPIs
- `DELETE /api/reset` — reset the in-memory dataset back to the 8 seed projects (demo convenience)

A ready-to-use `backend/sample_upload.csv` is included for testing the upload flow.

---

## 2. Run the frontend (React + Vite)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The frontend calls the backend at `http://localhost:8000/api` (see
`src/api.js`). If the backend isn't reachable, a banner appears and the app
falls back to pre-loaded sample data plus a client-side CSV parser for the
upload demo.

---

## Project structure

```
pragati/
├── backend/
│   ├── main.py              # FastAPI app: schema, risk engine, routes
│   ├── requirements.txt
│   └── sample_upload.csv    # sample dataset for testing uploads
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js   # MoSPI navy/saffron design tokens
    └── src/
        ├── App.jsx               # page routing + top-level state
        ├── api.js                 # axios client + CSV fallback parser
        ├── data/sampleProjects.js # 8 hardcoded seed projects
        ├── utils/riskEngine.js    # client-side risk scoring + KPI aggregation
        └── components/
            ├── Header.jsx
            ├── LandingPage.jsx       # public overview: KPIs, filters, charts
            ├── UploadPage.jsx        # drag-and-drop data ingestion
            ├── SiteMediaUpload.jsx   # site photos / inspection media attachments
            ├── AdminDashboard.jsx    # gov dashboard: table + insights
            ├── ProjectTable.jsx
            ├── ChartsSection.jsx
            ├── KPICards.jsx
            ├── SearchFilterBar.jsx
            ├── InsightsPanel.jsx
            └── RiskBadge.jsx
```

---

## 3. Deploying the frontend to Vercel

In the Vercel project settings set **Root Directory → `frontend`**. Everything
else is declared in `frontend/vercel.json` (framework, install/build commands,
output directory) and `frontend/.nvmrc` (Node 20).

Two things to keep in mind when adding packages:

- `frontend/.npmrc` — npm only reads `.npmrc` from the directory it installs
  in. It must sit next to `package.json`; a copy inside `public/` does nothing
  for installs and gets published as a static file on the live site.
- The 3D stack is pinned to the **React 18** line: `@react-three/fiber@8.x`,
  `@react-three/drei@9.x`, `three@0.169.x`. Fiber 9 / drei 10 require React 19
  and fail `npm install` with `ERESOLVE`. `react-leaflet` is pinned to `4.x`
  for the same reason — v5 is React 19 only.

After changing any dependency, regenerate `package-lock.json` and commit it —
Vercel's `npm ci` fails hard if the lockfile and `package.json` disagree.

---

## How the risk engine works

For each project, the model computes:

- **Cost variance** = % of budget utilised − % physical progress achieved
  (spending ahead of delivered work is a red flag)
- **Schedule variance** = % schedule progress − % physical progress achieved
  (falling behind the planned execution curve)
- **Delay penalty** = reported schedule slippage in months (capped)

These combine into a single `risk_score` (0–100), bucketed into:

- **On Track** — score < 25
- **Moderate Risk** — 25 ≤ score < 55
- **Critical Risk** — score ≥ 55

This mirrors a simplified Earned Value Management (EVM) approach used in real
infrastructure audits, kept intentionally lightweight for hackathon judging —
swap in a trained ML model against `compute_risk()` in `backend/main.py` as a
natural next step.

---

## Notes for the hackathon demo

- The 8 pre-loaded projects match the ministries/sectors named in the problem
  statement brief so the platform looks populated immediately.
- Uploading `backend/sample_upload.csv` on the Data Ingestion page
  demonstrates the full live-recalculation flow — KPIs, charts, and the
  admin table all update instantly with the new rows merged in.
- This is a hackathon prototype, not an official Government of India
  platform.
