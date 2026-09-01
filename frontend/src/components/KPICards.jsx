import { FolderKanban, IndianRupee, ShieldAlert, CheckSquare } from "lucide-react";
import { useCountUp } from "../utils/useCountUp";

function KPICard({ icon: Icon, label, value, format, sub, accent }) {
  const animated = useCountUp(value);
  return (
    <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-4 sm:p-5 flex items-start justify-between gap-3 animate-fade-up">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-xl sm:text-3xl font-display font-black text-navy-900 tabular-nums break-words">
          {format(animated)}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
      <div
        className="flex items-center justify-center h-11 w-11 rounded-lg shrink-0"
        style={{ backgroundColor: `${accent}1A` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={2.25} />
      </div>
    </div>
  );
}

export default function KPICards({ kpis }) {
  const milestonePct = kpis.milestonesTotal
    ? Math.round((kpis.milestonesCompleted / kpis.milestonesTotal) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        icon={FolderKanban}
        label="Total Projects Monitored"
        value={kpis.totalProjects}
        format={(v) => Math.round(v)}
        sub="Across all sectors & states"
        accent="#1E3A8A"
      />
      <KPICard
        icon={IndianRupee}
        label="Budget Allocated"
        value={kpis.totalBudget}
        format={(v) => `₹${Math.round(v).toLocaleString("en-IN")} Cr`}
        sub="Cumulative sanctioned outlay"
        accent="#D97706"
      />
      <KPICard
        icon={ShieldAlert}
        label="High-Risk Projects"
        value={kpis.highRisk}
        format={(v) => Math.round(v)}
        sub="Cost / schedule overruns flagged"
        accent="#DC2626"
      />
      <KPICard
        icon={CheckSquare}
        label="Completed Milestones"
        value={kpis.milestonesCompleted}
        format={(v) => `${Math.round(v)} / ${kpis.milestonesTotal}`}
        sub={`${milestonePct}% overall delivery`}
        accent="#15803D"
      />
    </div>
  );
}