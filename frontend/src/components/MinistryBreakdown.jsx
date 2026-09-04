import { Building2 } from "lucide-react";
import { useCountUp } from "../utils/useCountUp";
import { motion } from "motion/react";
import { useMemo, useRef, useEffect, useState } from "react";

export default function MinistryBreakdown({ projects }) {
  const ministryStats = useMemo(
    () => {
      const stats = {};
      projects.forEach((p) => {
        const ministry = p.ministry || "Unassigned";
        if (!stats[ministry]) {
          stats[ministry] = {
            ministry,
            count: 0,
            budget: 0,
            onTrack: 0,
            moderate: 0,
            critical: 0,
          };
        }
        stats[ministry].count += 1;
        stats[ministry].budget += Number(p.budget_cr) || 0;
        const riskScore = p.risk_score || 0;
        if (riskScore < 25) stats[ministry].onTrack += 1;
        else if (riskScore < 55) stats[ministry].moderate += 1;
        else stats[ministry].critical += 1;
      });
      return Object.values(stats).sort((a, b) => b.budget - a.budget);
    },
    [projects]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Ministry-wise Breakdown
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {ministryStats.map((stat, index) => {
          const animated = useCountUp(stat.budget, 600);
          const total = stat.onTrack + stat.moderate + stat.critical;
          const onTrackPct = total > 0 ? Math.round((stat.onTrack / total) * 100) : 0;
          const moderatePct = total > 0 ? Math.round((stat.moderate / total) * 100) : 0;
          const criticalPct = total > 0 ? Math.round((stat.critical / total) * 100) : 0;

          return (
            <motion.div
              key={stat.ministry}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-lg p-3 ring-1 ring-slate-200 hover:ring-slate-300 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-navy-900 truncate">{stat.ministry}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {stat.count} projects • ₹{Math.round(animated).toLocaleString("en-IN")} Cr
                  </p>
                </div>
              </div>
              {/* Risk distribution bar */}
              <div className="flex h-1.5 gap-0.5 rounded-full overflow-hidden bg-slate-100">
                {onTrackPct > 0 && (
                  <div
                    className="bg-green-600"
                    style={{ width: `${onTrackPct}%` }}
                    title={`On Track: ${stat.onTrack}`}
                  />
                )}
                {moderatePct > 0 && (
                  <div
                    className="bg-amber-500"
                    style={{ width: `${moderatePct}%` }}
                    title={`Moderate: ${stat.moderate}`}
                  />
                )}
                {criticalPct > 0 && (
                  <div
                    className="bg-red-600"
                    style={{ width: `${criticalPct}%` }}
                    title={`Critical: ${stat.critical}`}
                  />
                )}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                <span>🟢 {stat.onTrack}</span>
                <span>🟡 {stat.moderate}</span>
                <span>🔴 {stat.critical}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
