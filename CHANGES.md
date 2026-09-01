# PRAGATI — fix pass (1 Sep 2026)

Six issues: bot widget not reaching the live site, duplicate register rows, a
Ministry/Sector column overflow, the missing State Emblem, the Data Ingestion
UX, and mobile chart clipping. `npm` / `git` were unavailable on the machine
these edits were made on — **`npm install` + `npm run build` still need one
clean run before deploy**, and nothing here has been committed.

## 1. Bot widget not updating on the live site

**Cause:** the repo contained a committed second copy of the whole project at
`pragati/` (plus `pragati-source-fixed.zip`). That nested tree was byte-identical
to the root **except** `AiCopilotWidget.jsx`, which held a newer bot design.
Vercel builds the root (`vercel.json` → `frontend/dist`), so edits made in the
nested copy never shipped.

- Ported the newer bot (larger head, navy `#071a33` button, eyebrows, blush,
  glowing lens eyes) into the live file
  `frontend/src/components/AiCopilotWidget.jsx`, keeping the green "online" dot.
- Deleted the nested `pragati/` directory and `pragati-source-fixed.zip`. Run
  `git add -A` to stage the removals.

## 2. Project register had ~99 duplicate rows (218 → ~119)

Rows accumulate from three sources and repeated uploads of overlapping datasets
were never de-duplicated. Two projects are the same when **name + ministry +
state** match, case- and whitespace-insensitively; first occurrence wins.

- **Frontend** — `utils/riskEngine.js` gains `dedupeProjects()`; `App.jsx`
  applies it to the seed, the `/projects` response, and every synced dataset.
- **Backend** — `_dedupe_projects()` in `main.py`; applied in
  `_load_projects_from_db()` and after `/api/upload`. New **`POST /api/dedupe`**
  physically rewrites the table without the duplicates and returns
  `records_before` / `records_after` so the live count can be confirmed after
  the backend redeploys.

## 3. Ministry / Sector column overflowing into Location

The `<td>` had `max-w-[…]` but the table was auto-layout, so long ministry
names still set the column width and collided with the next cell.

**File:** `frontend/src/components/ProjectTable.jsx`

- Table is now `table-fixed` with a `<colgroup>` (23/25/15/12/15/10 %) and
  `min-w-[920px]` inside the existing `overflow-x-auto` wrapper — it scrolls on
  narrow screens instead of squishing.
- Sector, ministry, project name and location all `truncate` with the full
  value in a `title` tooltip.

## 4. State Emblem of India added to the header

**File:** `frontend/src/components/Header.jsx`

`<img src="/assets/national-emblem.svg">` at `h-9 sm:h-10`, `w-auto`, in the
top-left ahead of the saffron logo mark and the PRAGATI title block, with a
hairline divider (desktop only). **Swap
`frontend/public/assets/national-emblem.svg` for the official raster asset when
supplied** — sizing keys off height so aspect ratio is preserved automatically.

## 5. Data Ingestion tab — UX pass

**Files:** `frontend/src/components/UploadPage.jsx`, `frontend/src/api.js`

- Real transfer bar (0–100 %) via axios `onUploadProgress`, then an
  indeterminate "Analysing…" pulse for the server-side parse.
- 10 MB size guard with a specific message; empty-parse guard on the
  client-side fallback (which now also de-dupes).
- Remove-file (✕) affordance; the action button becomes "Upload another" and
  resets after a successful sync; dropzone is disabled/dimmed while processing.
- Empty-state helper line; expected columns rendered as chips; result banner
  aligned to the card system (`rounded-xl` + `ring-1`). No new colours/fonts.

## 6. Mobile responsiveness

- **Charts** (`ChartsSection.jsx`) — new `ScrollableChart` wrapper: each chart
  keeps a readable `min-width` on mobile (bar = `max(320, sectors × 64)`,
  pie = 280) inside `overflow-x-auto`, so it scrolls rather than clipping.
  Desktop unchanged (`min-width: 100%`).
- **KPI cards** — `min-w-0` + `break-words`, value `text-xl sm:text-3xl`,
  `p-4 sm:p-5` so wide `₹` figures don't overflow at 375 px.
- **Search / filter bar** — selects `flex-1 min-w-0` and wrap on mobile.
- **Header** — left cluster `min-w-0`, subtitle truncates, emblem/logo shrink
  a step on mobile.
- **Map modal** (`ProjectLocationMap.jsx`) — title/ministry truncate, close
  button `shrink-0`.

---

# PRAGATI — fix pass (31 Aug 2026)

Handoff notes for five issues: a broken table column, missing budget numbers,
dead progress bars, colliding chart labels, and an npm/Vercel build failure.

## ⚠️ Read this first

`package-lock.json` is **not** included in this archive, at either level. Three
dependency versions changed (see §5), so the old lockfiles were stale and
`npm ci` would have failed against them. Regenerate and commit:

```bash
cd frontend
npm install          # writes a fresh frontend/package-lock.json
npm run build        # must produce frontend/dist/
```

`node_modules/`, `dist/` and `__pycache__/` are also excluded.

---

## 1. Site photos / media upload — new feature

**New file:** `frontend/src/components/SiteMediaUpload.jsx`
**Touched:** `UploadPage.jsx` (renders it), `App.jsx` (owns the state)

- Drag-and-drop + click-to-browse. Accepts `image/*` and PDF, 15 MB per file,
  30 files max, with a per-file reason for anything skipped.
- Thumbnail grid showing File Name, Upload Timestamp, Size and Project ID,
  plus an inline category selector — Site Photo / Progress Snapshot /
  Inspection Report / Drone Survey / Geo-tagged Media — that stays editable
  after upload. Click a thumbnail for a lightbox; Esc closes it.
- Optional **Geo-tag** button: one `navigator.geolocation` call stamps
  lat/lng/accuracy onto subsequent uploads.
- State lives in `App.jsx` beside `projects`, so attachments survive tab
  switches and sit alongside the sector/budget record. Each item keeps its
  `File` handle, so POSTing the list to the backend later needs no re-read
  from disk.

Two deliberate choices worth not "tidying up":

- Object URLs are revoked on delete/clear but **not** on unmount — the list
  outlives the component, so unmount-revocation would leave dead previews.
- Every `createObjectURL` / `revokeObjectURL` call sits **outside** the React
  state updater. StrictMode double-invokes updaters; doing it inside minted
  and leaked a second object URL per file.

## 2. Chart X-axis labels overlapping

**File:** `frontend/src/components/ChartsSection.jsx`

`angle={0}` on desktop combined with `interval={0}` forced every sector name
onto one horizontal line, so long ones ("Urban Infrastructure", "Water
Infrastructure") collided and clipped.

A custom `<SectorTick>` now renders each label rotated **-45°**, anchored at
its end, truncated at 22 chars (14 on mobile) with the full name kept in an
SVG `<title>` tooltip. Axis `height` 32 → **104**, chart bottom margin 8 → 16,
container height 280 → 340 — the rotated text needs a gutter that actually
holds it.

## 3. MINISTRY / SECTOR column showed state names

**File:** `frontend/src/components/ProjectTable.jsx`

The cell was a literal copy of the Location cell — `<MapPin/> {p.state}`. It
now renders `p.sector` as the primary line with `p.ministry` beneath it, under
a `Landmark` icon.

## 4. Budget column stuck at 0, progress bars not filling

**Files:** `ProjectTable.jsx`, `utils/useInView.js`, `utils/useCountUp.js`,
`index.css`

**This was not a key-mapping bug.** Both cells were gated on
`start={inView}` from `useInView`, and `inView` never became `true`:

- `AnimatedBudget` passed `start ? value : 0` → count-up target `0` → rendered `0`.
- `ProgressBar` held `width` at `0` → no fill.

That one gate explains both symptoms, and explains why the `{pct}%` text —
which was never gated — kept showing the correct number.

The likely trigger: `index.css` set `overflow-x: hidden` on `html`, `body`
**and** `#root` at once. That makes them scroll containers, which clips
IntersectionObserver's view of anything below the fold.

Fixes:

- `index.css` — `overflow-x: hidden` followed by `overflow-x: clip`. `clip`
  suppresses the scrollbar without creating a scroll port; the `hidden` line
  above it is the fallback for browsers that don't know `clip`.
- `useInView.js` — rewritten around a **callback ref**, with a synchronous
  `getBoundingClientRect` check when the node attaches and a graceful fallback
  if `IntersectionObserver` is missing. It can no longer report `false` forever.
- `ProjectTable.jsx` — dropped the observer dependency entirely. Whether a
  number is correct must not depend on an animation trigger, so the table
  animates on mount instead.
- Progress bars fill via `.progress-fill` (`transition: width 900ms`) with a
  double-`requestAnimationFrame` so React paints one frame at 0 first —
  without that the transition has nothing to interpolate from, which is the
  specific reason the old bars appeared fully-formed. Added a 45 ms-per-row
  stagger, a `.progress-sheen` sweep, `role="progressbar"` ARIA, and a
  `prefers-reduced-motion` block that disables all of it.
- Added a key-alias resolver anyway (`budget_cr` → `budget` → `budgetCr` →
  `sanctioned_cost_cr` …) since rows arrive from three sources: seed data,
  FastAPI, and the client-side CSV parser. `useCountUp` now coerces non-finite
  targets to 0, so a bad key shows `0` rather than `NaN`.

## 5. npm install / Vercel build failures

Three independent faults, each verified against the installed tree and
`registry.npmjs.org`:

| # | Fault | Symptom |
|---|---|---|
| 1 | `@react-three/fiber@9.7.0` peer is `react >=19 <19.3`; `@react-three/drei@10.7.8` peer is `react ^19`. Project is React 18.3.1 | `ERESOLVE` |
| 2 | Root `package.json` declared `lucide-react@^1.37.0` — a version that has never existed (lucide-react is on `0.x`) | `ETARGET` |
| 3 | `.npmrc` was at `frontend/public/.npmrc` | npm never read it; Vite copied it into `dist/`, publishing it on the live site |

Changes:

- `frontend/package.json` → `@react-three/fiber@^8.16.8`,
  `@react-three/drei@^9.122.0`, `three@^0.169.0`. Verified: drei 9.122.0 is the
  top of the 9.x line, peers `react ^18`, `react-dom ^18`,
  `@react-three/fiber ^8`, `three >=0.137`.
- `react-leaflet` stays at **4.2.1** (peer `react ^18.0.0`). Do not move to
  v5 — it is React 19 only.
- Deleted `frontend/public/.npmrc`, which contained
  `dangerously-allow-all-scripts=true`. Real `frontend/.npmrc` now sits beside
  `package.json`, left in **strict** peer mode on purpose with
  `legacy-peer-deps` commented out: now that peers genuinely resolve, a future
  React-19-only package should fail loudly on a laptop rather than on Vercel.
- Root `package.json` rewritten as a dependency-free delegator.
- Added `frontend/.nvmrc` (Node 20), `frontend/vercel.json`, root `vercel.json`.

### Vercel setup

Set **Root Directory → `frontend`**. Everything else is in
`frontend/vercel.json`. `npm ci` is pinned there, so the regenerated
`package-lock.json` must be committed.

### If you would rather keep fiber 9 / drei 10

The only correct route is upgrading to React 19 (`react@^19 react-dom@^19`
plus `react-leaflet@^5`). `legacy-peer-deps=true` and `overrides` will make
the install succeed but leave drei calling React 19 APIs that do not exist in
18 — trading an install error for a runtime crash.

### SSR / hydration

This is a **Vite SPA, not Next.js** — `main.jsx` calls `createRoot`, there is
no server render, so no hydration mismatch is possible and
`dynamic(..., { ssr: false })` does not apply. The Vercel render errors came
from the failing install plus missing SPA rewrites (now in `vercel.json`).

Nothing under `src/` imports three / fiber / drei yet. When a Canvas is added,
code-split it — three.js is ~600 KB and would otherwise land in the initial
bundle:

```jsx
const Scene = lazy(() => import("./Scene"));   // Scene.jsx holds <Canvas>
<Suspense fallback={<div className="h-72" />}><Scene /></Suspense>
```

Keep `window` / `document` access inside `useEffect`, never at module scope.
On a future Next.js migration that becomes
`dynamic(() => import("./Scene"), { ssr: false })`.

---

## Not verified

`npm install` and `npm run build` were **not** run against these changes —
Node was not available on the machine where the fixes were made. The
dependency versions were checked against the npm registry, but the build
itself still needs one clean run before deploying.
