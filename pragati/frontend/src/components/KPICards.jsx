import { FolderKanban, IndianRupee, ShieldAlert, CheckSquare } from "lucide-react";

function KPICard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-5 flex items-start justify-between animate-fade-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl sm:text-3xl font-display font-black text-navy-900">{value}</p>
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
        sub="Across all sectors & states"
        accent="#1E3A8A"
      />
      <KPICard
        icon={IndianRupee}
        label="Budget Allocated"
        value={`₹${kpis.totalBudget.toLocaleString("en-IN")} Cr`}
        sub="Cumulative sanctioned outlay"
        accent="#D97706"
      />
      <KPICard
        icon={ShieldAlert}
        label="High-Risk Projects"
        value={kpis.highRisk}
        sub="Cost / schedule overruns flagged"
        accent="#DC2626"
      />
      <KPICard
        icon={CheckSquare}
        label="Completed Milestones"
        value={`${kpis.milestonesCompleted} / ${kpis.milestonesTotal}`}
        sub={`${milestonePct}% overall delivery`}
        accent="#15803D"
      />
    </div>
  );
}
