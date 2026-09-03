import { X, TrendingUp, CalendarClock, Timer, CheckCircle2, MinusCircle } from "lucide-react";
import RiskBadge from "./RiskBadge";

// Mirrors the scoring formula in utils/riskEngine.js / backend/main.py's
// compute_risk() so the breakdown shown here always matches the badge's
// actual number, instead of drifting out of sync with a second hand-typed
// explanation.
function breakdownRisk(project) {
  const budgetCr = Number(project.budget_cr) || 0;
  const budgetUtilizedCr = Number(project.budget_utilized_cr) || 0;
  const physicalPct = Number(project.physical_progress_pct) || 0;
  const schedulePct = Number(project.schedule_progress_pct) || 0;
  const delayMonths = Number(project.delay_months) || 0;

  const budgetUtilizedPct = budgetCr ? (budgetUtilizedCr / budgetCr) * 100 : 0;
  const costVariance = budgetUtilizedPct - physicalPct;
  const scheduleVariance = schedulePct - physicalPct;

  const costContribution = Math.max(costVariance, 0) * 0.6;
  const scheduleContribution = Math.max(scheduleVariance, 0) * 0.6;
  const delayContribution = Math.min(delayMonths * 6, 40);

  return {
    budgetUtilizedPct,
    physicalPct,
    schedulePct,
    delayMonths,
    costVariance,
    scheduleVariance,
    costContribution,
    scheduleContribution,
    delayContribution,
  };
}

function FactorRow({ icon: Icon, active, title, detail, contribution }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-3 ring-1 ring-inset ${
        active ? "bg-alert-600/5 ring-alert-600/15" : "bg-success-500/5 ring-success-500/15"
      }`}
    >
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
          active ? "bg-alert-600/10 text-alert-600" : "bg-success-500/10 text-success-600"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
      </div>
      {active && (
        <span className="shrink-0 text-xs font-mono font-semibold text-alert-600 bg-alert-600/10 rounded-md px-2 py-1">
          +{contribution.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default function RiskDetailModal({ project, onClose }) {
  if (!project) return null;

  const b = breakdownRisk(project);
  const costActive = b.costVariance > 0;
  const scheduleActive = b.scheduleVariance > 0;
  const delayActive = b.delayMonths > 0;
  const noSignals = !costActive && !scheduleActive && !delayActive;

  return (
    <div
      className="fixed inset-0 z-[1100] bg-navy-900/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="bg-navy-900 text-white px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" title={project.name}>{project.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate" title={project.ministry}>
              {project.ministry}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close risk breakdown"
            className="shrink-0 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI Overrun Risk
              </p>
              <p className="text-2xl font-display font-black text-navy-900 mt-0.5">
                {project.risk_score}
                <span className="text-sm font-semibold text-slate-400"> / 100</span>
              </p>
            </div>
            <RiskBadge status={project.risk_status} size="lg" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Why this rating
            </p>

            {noSignals ? (
              <div className="flex items-start gap-3 rounded-xl p-3 bg-success-500/5 ring-1 ring-inset ring-success-500/15">
                <CheckCircle2 className="h-4 w-4 text-success-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                <p className="text-sm text-slate-600">
                  No overrun signals detected — spending, schedule, and timeline are all in line
                  with physical progress on the ground.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FactorRow
                  icon={costActive ? TrendingUp : MinusCircle}
                  active={costActive}
                  contribution={b.costContribution}
                  title={
                    costActive
                      ? "Spending is outpacing physical work"
                      : "Spending is in line with physical work"
                  }
                  detail={`${b.budgetUtilizedPct.toFixed(0)}% of budget used vs. ${b.physicalPct.toFixed(0)}% physical progress on the ground.`}
                />
                <FactorRow
                  icon={scheduleActive ? CalendarClock : MinusCircle}
                  active={scheduleActive}
                  contribution={b.scheduleContribution}
                  title={
                    scheduleActive
                      ? "Behind where the schedule says it should be"
                      : "On pace with the planned schedule"
                  }
                  detail={`Schedule expects ${b.schedulePct.toFixed(0)}% complete by now, but physical progress is ${b.physicalPct.toFixed(0)}%.`}
                />
                <FactorRow
                  icon={delayActive ? Timer : MinusCircle}
                  active={delayActive}
                  contribution={b.delayContribution}
                  title={delayActive ? "Reported delay against timeline" : "No reported delay"}
                  detail={
                    delayActive
                      ? `${b.delayMonths} month(s) behind the original timeline (capped at 40 points).`
                      : "No delay has been logged against this project's original timeline."
                  }
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div className="pt-3">
              <p className="text-xs text-slate-500">Milestones completed</p>
              <p className="text-sm font-semibold text-navy-900 mt-0.5">
                {project.milestones_completed} / {project.milestones_total}
              </p>
            </div>
            <div className="pt-3">
              <p className="text-xs text-slate-500">Budget utilised</p>
              <p className="text-sm font-semibold text-navy-900 mt-0.5">
                ₹{Number(project.budget_utilized_cr).toLocaleString("en-IN")} Cr / ₹
                {Number(project.budget_cr).toLocaleString("en-IN")} Cr
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Score = 0.6 × cost overrun + 0.6 × schedule overrun + delay penalty (capped at 40),
            clamped to 0–100. This is a heuristic model based on the uploaded dataset, not a
            certified audit finding.
          </p>
        </div>
      </div>
    </div>
  );
}