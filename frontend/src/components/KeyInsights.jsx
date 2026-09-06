import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Landmark,
  Percent,
  Gauge,
  Building2,
  MapPin,
  Timer,
} from "lucide-react";

function InsightTile({ icon: Icon, label, value, sub, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="bg-white/5 rounded-xl p-4 flex items-start gap-3 ring-1 ring-white/10"
    >
      <div
        className="flex items-center justify-center h-9 w-9 rounded-lg shrink-0"
        style={{ backgroundColor: `${accent}26` }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          {label}
        </p>
        <p className="mt-1 text-lg font-display font-black text-white tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
      </div>
    </motion.div>
  );
}

// Bottom-of-tab micro-analytics strip. Distinct from InsightsPanel (which
// calls out specific at-risk / top-performing projects) — this rolls the
// entire register up into single-number summary stats for a quick read of
// dataset health without opening the table.
export default function KeyInsights({ projects, kpis }) {
  const stats = useMemo(() => {
    const sectorCount = new Set(projects.map((p) => p.sector).filter(Boolean)).size;
    const ministryCount = new Set(projects.map((p) => p.ministry).filter(Boolean)).size;
    const stateCount = new Set(projects.map((p) => p.state).filter(Boolean)).size;

    const budgetUtilizedPct = kpis.totalBudget
      ? Math.round(
          (projects.reduce((sum, p) => sum + Number(p.budget_utilized_cr || 0), 0) /
            kpis.totalBudget) *
            100
        )
      : 0;

    const avgProgress = projects.length
      ? Math.round(
          projects.reduce((sum, p) => sum + Number(p.physical_progress_pct || 0), 0) /
            projects.length
        )
      : 0;

    const avgDelay = projects.length
      ? (
          projects.reduce((sum, p) => sum + Number(p.delay_months || 0), 0) / projects.length
        ).toFixed(1)
      : 0;

    const riskFreePct = kpis.totalProjects
      ? Math.round((kpis.onTrack / kpis.totalProjects) * 100)
      : 0;

    return {
      sectorCount,
      ministryCount,
      stateCount,
      budgetUtilizedPct,
      avgProgress,
      avgDelay,
      riskFreePct,
    };
  }, [projects, kpis]);

  return (
    <div className="bg-navy-900 rounded-2xl shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-saffron-500" />
        <div>
          <p className="font-display font-bold text-white">Website &amp; Project Key Insights</p>
          <p className="text-xs text-slate-400">
            Micro-analytics summarising the full monitored dataset for this session
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        <InsightTile
          icon={Layers}
          label="Sectors Tracked"
          value={stats.sectorCount}
          accent="#F59E0B"
          index={0}
        />
        <InsightTile
          icon={Landmark}
          label="Ministries Involved"
          value={stats.ministryCount}
          accent="#38BDF8"
          index={1}
        />
        <InsightTile
          icon={MapPin}
          label="States Covered"
          value={stats.stateCount}
          accent="#10B981"
          index={2}
        />
        <InsightTile
          icon={Percent}
          label="Budget Utilised"
          value={`${stats.budgetUtilizedPct}%`}
          sub="Of total sanctioned outlay"
          accent="#EF4444"
          index={3}
        />
        <InsightTile
          icon={Gauge}
          label="Avg. Physical Progress"
          value={`${stats.avgProgress}%`}
          accent="#8B5CF6"
          index={4}
        />
        <InsightTile
          icon={Timer}
          label="Avg. Schedule Slippage"
          value={`${stats.avgDelay} mo`}
          accent="#F97316"
          index={5}
        />
        <InsightTile
          icon={Building2}
          label="Projects On Track"
          value={`${stats.riskFreePct}%`}
          sub={`${kpis.onTrack} of ${kpis.totalProjects} projects`}
          accent="#16A34A"
          index={6}
        />
        <InsightTile
          icon={Sparkles}
          label="Total Register Size"
          value={kpis.totalProjects}
          sub="Deduplicated live records"
          accent="#E09900"
          index={7}
        />
      </div>
    </div>
  );
}
