import { Lightbulb, TrendingDown, TrendingUp, Clock } from "lucide-react";

export default function InsightsPanel({ projects }) {
  const critical = projects
    .filter((p) => p.risk_status === "Critical Risk")
    .sort((a, b) => b.risk_score - a.risk_score);

  const mostDelayed = [...projects].sort((a, b) => b.delay_months - a.delay_months)[0];
  const bestPerformer = [...projects].sort(
    (a, b) => b.physical_progress_pct - a.physical_progress_pct
  )[0];

  return (
    <div className="bg-navy-900 rounded-xl shadow-card p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-saffron-500" />
        <p className="font-display font-bold">Actionable Insights for Officials</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
          <TrendingDown className="h-4 w-4 text-alert-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-200">
            <span className="font-semibold text-white">{critical.length} project(s)</span> flagged
            Critical Risk
            {critical[0] && (
              <>
                {" "}
                — top concern:{" "}
                <span className="font-semibold text-white">{critical[0].name}</span> ({critical[0].sector})
              </>
            )}
            . Recommend immediate review meeting with the executing ministry.
          </p>
        </div>

        {mostDelayed && (
          <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
            <Clock className="h-4 w-4 text-saffron-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200">
              <span className="font-semibold text-white">{mostDelayed.name}</span> is reporting the
              longest schedule slippage at{" "}
              <span className="font-semibold text-white">{mostDelayed.delay_months} month(s)</span>.
              Consider reallocating contractor resources.
            </p>
          </div>
        )}

        {bestPerformer && (
          <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
            <TrendingUp className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200">
              <span className="font-semibold text-white">{bestPerformer.name}</span> leads on physical
              progress at{" "}
              <span className="font-semibold text-white">{bestPerformer.physical_progress_pct}%</span> —
              a useful execution benchmark for comparable projects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
