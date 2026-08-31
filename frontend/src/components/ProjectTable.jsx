import { useEffect, useState } from "react";
import RiskBadge from "./RiskBadge";
import { Landmark, MapPin } from "lucide-react";
import { useCountUp } from "../utils/useCountUp";
import ProjectLocationMap from "./ProjectLocationMap";

// Rows reach this table from three places — the seed dataset, the FastAPI
// response, and the client-side CSV fallback parser — and a header typo or a
// renamed backend field used to surface as a silent `0` in the budget column.
// Resolving each display field through a short alias list keeps the register
// readable when the incoming shape drifts, instead of failing quietly.
const FIELD_ALIASES = {
  budget: ["budget_cr", "budget", "budgetCr", "sanctioned_cost_cr", "total_budget_cr"],
  sector: ["sector", "sector_name", "Sector"],
  ministry: ["ministry", "ministry_name", "Ministry", "nodal_ministry"],
  progress: ["physical_progress_pct", "physical_progress", "progress_pct", "physicalProgressPct"],
};

function resolve(project, field) {
  for (const key of FIELD_ALIASES[field]) {
    const value = project?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function ProgressBar({ pct, delay = 0 }) {
  const [width, setWidth] = useState(0);

  // Paint one frame at 0 before setting the real width, otherwise React
  // commits the final width in the same frame and the CSS transition has
  // nothing to interpolate from — which is why these bars previously
  // appeared fully-formed with no fill animation at all.
  useEffect(() => {
    let inner = null;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setWidth(pct));
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner) cancelAnimationFrame(inner);
    };
  }, [pct]);

  const color = pct >= 70 ? "#15803D" : pct >= 40 ? "#D97706" : "#DC2626";

  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div
        className="relative h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Physical progress ${pct} percent`}
      >
        <div
          className="progress-fill h-full rounded-full"
          style={{
            width: `${Math.min(Math.max(width, 0), 100)}%`,
            backgroundColor: color,
            transitionDelay: `${delay}ms`,
          }}
        />
        <div
          className="progress-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3"
          style={{ animationDelay: `${delay}ms` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 w-9 text-right tabular-nums">{pct}%</span>
    </div>
  );
}

function AnimatedBudget({ value }) {
  const animated = useCountUp(value, 900);
  return <span className="tabular-nums">{Math.round(animated).toLocaleString("en-IN")}</span>;
}

export default function ProjectTable({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-navy-900">Project Tracking Register</p>
          <p className="text-xs text-slate-500">{projects.length} record(s) matching current filters</p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">Project Name</th>
              <th className="px-5 py-3 font-semibold">Ministry / Sector</th>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Budget (₹ Cr)</th>
              <th className="px-5 py-3 font-semibold">Physical Progress</th>
              <th className="px-5 py-3 font-semibold">AI Overrun Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p, index) => {
              const sector = resolve(p, "sector") ?? "Unclassified";
              const ministry = resolve(p, "ministry");
              const budget = toNumber(resolve(p, "budget"));
              const progress = Math.round(toNumber(resolve(p, "progress")));

              return (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-navy-900 max-w-[220px]">
                    {p.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[230px]">
                    <span className="inline-flex items-start gap-1.5">
                      <Landmark className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="min-w-0">
                        <span className="block font-medium text-navy-900">{sector}</span>
                        {ministry && (
                          <span className="block text-xs text-slate-500 truncate" title={ministry}>
                            {ministry}
                          </span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <button
                      onClick={() => setSelectedProject(p)}
                      title="View on map"
                      className="inline-flex items-center gap-1 hover:text-navy-900 hover:underline decoration-dotted underline-offset-2 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {p.state}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-navy-900">
                    <AnimatedBudget value={budget} />
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Small per-row stagger so the column fills as a cascade
                        rather than every bar snapping at once. */}
                    <ProgressBar pct={progress} delay={Math.min(index, 12) * 45} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskBadge status={p.risk_status} score={p.risk_score} />
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                  No projects match the current search & filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProjectLocationMap project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
