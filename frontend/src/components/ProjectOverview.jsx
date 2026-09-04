import { useMemo } from "react";
import MinistryBreakdown from "./MinistryBreakdown";
import SectorBreakdown from "./SectorBreakdown";
import Project3DShowcase from "./Project3DShowcase";
import { motion } from "motion/react";

export default function ProjectOverview({ projects }) {
  const stats = useMemo(() => {
    const total = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget_cr) || 0), 0);
    const onTrack = projects.filter((p) => (p.risk_score || 0) < 25).length;
    const moderate = projects.filter((p) => {
      const r = p.risk_score || 0;
      return r >= 25 && r < 55;
    }).length;
    const critical = projects.filter((p) => (p.risk_score || 0) >= 55).length;

    return { total, totalBudget, onTrack, moderate, critical };
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-6 ring-1 ring-slate-900/5 shadow-card"
      >
        <h1 className="font-display font-black text-2xl text-navy-900 mb-2">Project Overview</h1>
        <p className="text-slate-600 text-sm">
          Comprehensive visualization of infrastructure projects by ministry and sector with real-time 3D analytics
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 font-semibold">Total Projects</p>
            <p className="text-lg font-bold text-navy-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 font-semibold">Total Budget</p>
            <p className="text-lg font-bold text-navy-900 mt-1">₹{Math.round(stats.totalBudget).toLocaleString("en-IN")} Cr</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700 font-semibold">On Track</p>
            <p className="text-lg font-bold text-green-900 mt-1">{stats.onTrack}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-700 font-semibold">At Risk</p>
            <p className="text-lg font-bold text-red-900 mt-1">{stats.moderate + stats.critical}</p>
          </div>
        </div>
      </motion.section>

      {/* Main Layout: Left (Breakdowns) + Right (3D) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Breakdowns */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="bg-white rounded-xl p-4 ring-1 ring-slate-900/5 shadow-card">
            <MinistryBreakdown projects={projects} />
          </div>
          <div className="bg-white rounded-xl p-4 ring-1 ring-slate-900/5 shadow-card">
            <SectorBreakdown projects={projects} />
          </div>
        </motion.div>

        {/* Right Column: 3D Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl p-4 ring-1 ring-slate-900/5 shadow-card overflow-hidden"
          style={{ minHeight: "600px" }}
        >
          <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
            <span className="text-lg">🎨</span>
            3D Project Analytics
          </h3>
          <div className="w-full h-[550px] rounded-lg overflow-hidden">
            <Project3DShowcase projects={projects} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
