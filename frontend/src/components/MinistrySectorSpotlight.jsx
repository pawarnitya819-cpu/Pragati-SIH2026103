import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Train, Zap, Waves, Waypoints } from "lucide-react";
import SectorIllustration from "./SectorIllustration";

export default function MinistrySectorSpotlight({ projects }) {
  // Calculate ministry stats (reuse logic from MinistryBreakdown)
  const ministryStats = useMemo(() => {
    const stats = {};
    projects.forEach((p) => {
      const ministry = p.ministry || "Unassigned";
      if (!stats[ministry]) {
        stats[ministry] = {
          ministry,
          count: 0,
          budget: 0,
          expenditure: 0,
          revisedCost: 0,
          completedThisMonth: 0,
          newlyAdded: 0,
        };
      }
      stats[ministry].count += 1;
      stats[ministry].budget += Number(p.budget_cr) || 0;
      stats[ministry].expenditure += Number(p.budget_utilized_cr) || 0;
      // For now, using budget as revised cost (can be enhanced)
      stats[ministry].revisedCost += Number(p.budget_cr) || 0;
      // Simplified calculations for completed this month and newly added
      // In a real implementation, these would come from actual data
      if (p.physical_progress_pct >= 100) {
        stats[ministry].completedThisMonth += 1;
      }
      // Simplified: consider projects with ID containing "seed" as existing, others as new
      if (!p.id.includes("seed")) {
        stats[ministry].newlyAdded += 1;
      }
    });
    return Object.values(stats).sort((a, b) => b.budget - a.budget);
  }, [projects]);

  // Calculate sector stats
  const sectorStats = useMemo(() => {
    const stats = {};
    projects.forEach((p) => {
      const sector = p.sector || "Unassigned";
      if (!stats[sector]) {
        stats[sector] = {
          sector,
          count: 0,
          budget: 0,
          expenditure: 0,
          revisedCost: 0,
          completedThisMonth: 0,
          newlyAdded: 0,
        };
      }
      stats[sector].count += 1;
      stats[sector].budget += Number(p.budget_cr) || 0;
      stats[sector].expenditure += Number(p.budget_utilized_cr) || 0;
      stats[sector].revisedCost += Number(p.budget_cr) || 0;
      if (p.physical_progress_pct >= 100) {
        stats[sector].completedThisMonth += 1;
      }
      if (!p.id.includes("seed")) {
        stats[sector].newlyAdded += 1;
      }
    });
    return Object.values(stats).sort((a, b) => b.budget - a.budget);
  }, [projects]);

  const [viewMode, setViewMode] = useState("sector"); // "ministry" or "sector"
  const [selectedItem, setSelectedItem] = useState(
    viewMode === "sector"
      ? sectorStats[0]?.sector || "Roads"
      : ministryStats[0]?.ministry || "Ministry of Road Transport & Highways"
  );

  // Update selected item when view mode changes
  const updateSelectedItem = () => {
    if (viewMode === "sector" && sectorStats.length > 0) {
      setSelectedItem(sectorStats[0].sector);
    } else if (ministryStats.length > 0) {
      setSelectedItem(ministryStats[0].ministry);
    }
  };

  // Get current stats based on view mode and selected item
  const currentStats = useMemo(() => {
    if (viewMode === "sector") {
      return sectorStats.find((s) => s.sector === selectedItem) || {
        sector: selectedItem,
        count: 0,
        budget: 0,
        expenditure: 0,
        revisedCost: 0,
        completedThisMonth: 0,
        newlyAdded: 0,
      };
    } else {
      return ministryStats.find((m) => m.ministry === selectedItem) || {
        ministry: selectedItem,
        count: 0,
        budget: 0,
        expenditure: 0,
        revisedCost: 0,
        completedThisMonth: 0,
        newlyAdded: 0,
      };
    }
  }, [viewMode, selectedItem, sectorStats, ministryStats]);

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Toggle Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setViewMode("sector");
            updateSelectedItem();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === "sector"
              ? "bg-saffron-500 text-white"
              : "bg-white border border-slate-200 text-navy-900"
          } transition-all`}
        >
          Sector-Wise
        </button>
        <button
          onClick={() => {
            setViewMode("ministry");
            updateSelectedItem();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === "ministry"
              ? "bg-saffron-500 text-white"
              : "bg-white border border-slate-200 text-navy-900"
          } transition-all`}
        >
          Ministry-Wise
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Panel: Pill List */}
        <div className="space-y-2">
          {viewMode === "sector" ? (
            <>
              {Object.entries({
                Roads: Waypoints,
                Railways: Train,
                Power: Zap,
                "Urban Infrastructure": Building2,
                Waterways: Waves,
              }).map(([sector, Icon]) => {
                const isActive = selectedItem === sector;
                return (
                  <motion.div
                    key={sector}
                    onClick={() => setSelectedItem(sector)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Object.entries({
                      Roads: Waypoints,
                      Railways: Train,
                      Power: Zap,
                      "Urban Infrastructure": Building2,
                      Waterways: Waves,
                    }).findIndex(([s]) => s === sector) * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isActive
                        ? "bg-saffron-500/10 border-l-4 border-saffron-500"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                    } cursor-pointer transition-all`}
                  >
                    <div
                      className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
                      style={{ backgroundColor: `${isActive ? "bg-saffron-500/20" : "bg-slate-50"}` }}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-saffron-500" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className={`font-medium text-navy-900 ${
                        isActive ? "text-saffron-500" : "text-slate-700"
                      } truncate`}>
                        {sector}
                      </p>
                      {isActive && <span className="ml-2 text-saffron-500">▾</span>}
                    </div>
                  </motion.div>
                );
              })}
            </>
          ) : (
            <>
              {ministryStats.map((stat) => {
                const isActive = selectedItem === stat.ministry;
                return (
                  <motion.div
                    key={stat.ministry}
                    onClick={() => setSelectedItem(stat.ministry)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: ministryStats.indexOf(stat) * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isActive
                        ? "bg-saffron-500/10 border-l-4 border-saffron-500"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                    } cursor-pointer transition-all`}
                  >
                    <div
                      className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
                      style={{ backgroundColor: `${isActive ? "bg-saffron-500/20" : "bg-slate-50"}` }}
                    >
                      <Building2 className={`h-4 w-4 ${isActive ? "text-saffron-500" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className={`font-medium text-navy-900 ${
                        isActive ? "text-saffron-500" : "text-slate-700"
                      } truncate max-w-xs`}>
                        {stat.ministry}
                      </p>
                      {isActive && <span className="ml-2 text-saffron-500">▾</span>}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>

        {/* Right Panel: Stat Card + Illustration */}
        <div className="space-y-4">
          {/* Stat Card Header */}
          <div className="flex items-center justify-between bg-navy-900 px-4 py-3 rounded-t-lg">
            <h3 className="font-display font-bold text-sm text-white">
              {selectedItem}
            </h3>
            <p className="text-xs text-saffron-200">
              (as of {getCurrentDate()})
            </p>
          </div>

          {/* Stat Card Body */}
          <div className="bg-white rounded-b-lg p-4 space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project Count
                </p>
                <p className="text-lg font-display font-bold text-navy-900">
                  {currentStats.count}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Original Cost
                </p>
                <p className="text-lg font-display font-bold text-navy-900">
                  ₹{Math.round(currentStats.budget).toLocaleString("en-IN")} Cr
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Latest Revised Cost
                </p>
                <p className="text-lg font-display font-bold text-navy-900">
                  ₹{Math.round(currentStats.revisedCost).toLocaleString("en-IN")} Cr
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expenditure (Cumm.)
                </p>
                <p className="text-lg font-display font-bold text-navy-900">
                  ₹{Math.round(currentStats.expenditure).toLocaleString("en-IN")} Cr
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Completed During Month
                </p>
                <p className="text-lg font-display font-bold text-navy-900">
                  {currentStats.completedThisMonth}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Newly Added
                </p>
                <p className="text-lg font-display font-bold text-navy-900">
                  {currentStats.newlyAdded}
                </p>
              </div>
            </div>
          </div>

          {/* Sector Illustration (only for sector view) */}
          {viewMode === "sector" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedItem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="md:flex md:items-center md:justify-center md:h-96"
              >
                <SectorIllustration sector={selectedItem} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}