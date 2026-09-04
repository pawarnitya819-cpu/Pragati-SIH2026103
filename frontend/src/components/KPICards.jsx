import { FolderKanban, IndianRupee, ShieldAlert, CheckSquare } from "lucide-react";
import { useCountUp } from "../utils/useCountUp";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

function KPICard({ icon: Icon, label, value, format, sub, accent, index }) {
  const animated = useCountUp(value);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-4 sm:p-5 flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-xl sm:text-3xl font-display font-black text-navy-900 tabular-nums break-words">
          {format(animated)}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
      <motion.div
        className="flex items-center justify-center h-11 w-11 rounded-lg shrink-0"
        style={{ backgroundColor: `${accent}1A` }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={2.25} />
      </motion.div>
    </motion.div>
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
        index={0}
      />
      <KPICard
        icon={IndianRupee}
        label="Budget Allocated"
        value={kpis.totalBudget}
        format={(v) => `₹${Math.round(v).toLocaleString("en-IN")} Cr`}
        sub="Cumulative sanctioned outlay"
        accent="#D97706"
        index={1}
      />
      <KPICard
        icon={ShieldAlert}
        label="High-Risk Projects"
        value={kpis.highRisk}
        format={(v) => Math.round(v)}
        sub="Cost / schedule overruns flagged"
        accent="#DC2626"
        index={2}
      />
      <KPICard
        icon={CheckSquare}
        label="Completed Milestones"
        value={kpis.milestonesCompleted}
        format={(v) => `${Math.round(v)} / ${kpis.milestonesTotal}`}
        sub={`${milestonePct}% overall delivery`}
        accent="#15803D"
        index={3}
      />
    </div>
  );
}