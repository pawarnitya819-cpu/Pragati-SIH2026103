import { useEffect, useState } from "react";
import RiskBadge from "./RiskBadge";
import { MapPin } from "lucide-react";
import { useCountUp } from "../utils/useCountUp";
import { useInView } from "../utils/useInView";

function ProgressBar({ pct, start }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!start) return;
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct, start]);

  const color = pct >= 70 ? "#15803D" : pct >= 40 ? "#D97706" : "#DC2626";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(width, 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 w-9 text-right">{pct}%</span>
    </div>
  );
}

function AnimatedBudget({ value, start }) {
  const animated = useCountUp(start ? value : 0, 1000);
  return <span className="tabular-nums">{Math.round(animated).toLocaleString("en-IN")}</span>;
}

export default function ProjectTable({ projects }) {
  const [tableRef, inView] = useInView({ threshold: 0.1 });

  return (
    <div ref={tableRef} className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 overflow-hidden">
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
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-navy-900 max-w-[220px]">
                  {p.name}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  <p>{p.ministry}</p>
                  <p className="text-xs text-navy-700 font-medium mt-0.5">{p.sector}</p>
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {p.state}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-navy-900">
                  <AnimatedBudget value={Number(p.budget_cr)} start={inView} />
                </td>
                <td className="px-5 py-3.5">
                  <ProgressBar pct={Math.round(p.physical_progress_pct)} start={inView} />
                </td>
                <td className="px-5 py-3.5">
                  <RiskBadge status={p.risk_status} score={p.risk_score} />
                </td>
              </tr>
            ))}
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
    </div>
  );
}