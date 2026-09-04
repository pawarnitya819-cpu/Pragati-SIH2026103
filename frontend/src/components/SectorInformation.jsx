import { Building2, Zap, Waves, Train, Waypoints, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SECTOR_INFO = {
  Roads: {
    icon: Waypoints,
    color: "#1E3A8A",
    ministry: "Ministry of Road Transport & Highways",
    description: "National highways, expressways, and state road networks connecting India",
    investment: "₹5,80,000 Cr+",
    projects: "500+ major projects",
    beneficiaries: "Nationwide connectivity",
    keyMetrics: [
      { label: "Total Length", value: "45,000+ km" },
      { label: "Avg Investment", value: "₹1,160 Cr per project" },
      { label: "Employment Generated", value: "500,000+ jobs" },
    ],
  },
  Railways: {
    icon: Train,
    color: "#D97706",
    ministry: "Ministry of Railways",
    description: "Railway infrastructure, high-speed corridors, and modernization projects",
    investment: "₹8,50,000 Cr+",
    projects: "300+ major projects",
    beneficiaries: "75+ crore passengers annually",
    keyMetrics: [
      { label: "New Rail Lines", value: "8,000+ km" },
      { label: "Stations Modernized", value: "1,000+" },
      { label: "Investment Per Project", value: "₹2,833 Cr" },
    ],
  },
  Power: {
    icon: Zap,
    color: "#15803D",
    ministry: "Ministry of Power / Ministry of New & Renewable Energy",
    description: "Power generation, transmission, renewable energy, and grid modernization",
    investment: "₹4,20,000 Cr+",
    projects: "400+ major projects",
    beneficiaries: "24/7 electricity to 100+ crore people",
    keyMetrics: [
      { label: "Capacity Added", value: "150+ GW" },
      { label: "Renewable Share", value: "50%+ target" },
      { label: "Grid Efficiency", value: "98%+ uptime" },
    ],
  },
  "Urban Infrastructure": {
    icon: Building2,
    color: "#DC2626",
    ministry: "Ministry of Housing & Urban Affairs",
    description: "Smart cities, metro rail, water supply, sewage, and urban amenities",
    investment: "₹3,10,000 Cr+",
    projects: "250+ major projects",
    beneficiaries: "50+ crore urban population",
    keyMetrics: [
      { label: "Metro Network", value: "1,000+ km" },
      { label: "Smart Cities", value: "100+ cities" },
      { label: "Water Coverage", value: "95%+ households" },
    ],
  },
  Waterways: {
    icon: Waves,
    color: "#7C3AED",
    ministry: "Ministry of Ports, Shipping & Waterways",
    description: "Inland waterway development, port expansion, and maritime infrastructure",
    investment: "₹1,50,000 Cr+",
    projects: "150+ major projects",
    beneficiaries: "30+ ports & 111 waterways",
    keyMetrics: [
      { label: "Port Capacity", value: "1,800+ MMTPA" },
      { label: "Waterway Cargo", value: "500+ MT annually" },
      { label: "Terminals Modernized", value: "80+" },
    ],
  },
};

function SectorCard({ sector, data }) {
  const Icon = data.icon;

  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 overflow-hidden hover:shadow-lg hover:ring-slate-900/10 transition-all duration-300">
      <div
        className="h-1.5"
        style={{ backgroundColor: data.color }}
      />

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0 mt-0.5"
              style={{ backgroundColor: `${data.color}1A` }}
            >
              <Icon className="h-5 w-5" style={{ color: data.color }} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-lg text-navy-900">
                {sector}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{data.ministry}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {data.description}
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Investment
            </p>
            <p className="text-sm font-display font-bold text-navy-900 mt-1">
              {data.investment}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Projects
            </p>
            <p className="text-sm font-display font-bold text-navy-900 mt-1">
              {data.projects}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reach
            </p>
            <p className="text-sm font-display font-bold text-navy-900 mt-1 line-clamp-2 text-xs">
              {data.beneficiaries}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Key Metrics
          </p>
          <div className="space-y-1.5">
            {data.keyMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <p className="text-xs text-slate-600">{metric.label}</p>
                <p className="text-xs font-semibold text-navy-900">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectorInformation() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-navy-900">
          Infrastructure Sectors at a Glance
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Comprehensive investment and progress overview across India's major infrastructure sectors
        </p>
      </div>

      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-slate-50 rounded-full p-2 shadow-lg ring-1 ring-slate-900/10 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-navy-900" />
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-slate-50 rounded-full p-2 shadow-lg ring-1 ring-slate-900/10 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5 text-navy-900" />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="overflow-x-auto scrollbar-thin scroll-smooth"
        >
          <div className="flex gap-4 pb-2 px-1">
            {Object.entries(SECTOR_INFO).map(([sector, data]) => (
              <SectorCard
                key={sector}
                sector={sector}
                data={data}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-navy-900/5 to-saffron-600/5 rounded-xl p-6 border border-slate-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold text-navy-900">Note:</span> All figures represent cumulative investments, ongoing projects, and targets under central infrastructure monitoring. Data is updated regularly through PRAGATI tracking systems and nodal ministry submissions. For detailed project-level information, use the search and filter tools in the dashboard above.
        </p>
      </div>
    </div>
  );
}

