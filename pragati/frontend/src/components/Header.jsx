import { LandmarkIcon, UploadCloud, LayoutDashboard, Globe2 } from "lucide-react";

const NAV_ITEMS = [
  { key: "landing", label: "Public Overview", icon: Globe2 },
  { key: "upload", label: "Data Ingestion", icon: UploadCloud },
  { key: "admin", label: "Government Dashboard", icon: LayoutDashboard },
];

export default function Header({ page, setPage }) {
  return (
    <header className="sticky top-0 z-40 bg-navy-900 shadow-lg">
      <div className="tricolor-strip" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-saffron-600/90">
              <LandmarkIcon className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <p className="font-display font-black tracking-tight text-white text-lg sm:text-xl">
                PRAGATI
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium tracking-wide uppercase">
                Unified Infrastructure Project Monitoring · MoSPI
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-navy-800/60 rounded-lg p-1">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = page === key;
              return (
                <button
                  key={key}
                  onClick={() => setPage(key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${
                    active
                      ? "bg-saffron-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-navy-700/70"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex flex-col items-end leading-tight">
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
              SIH26103
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Govt. of India</span>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden gap-1 pb-2 -mt-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = page === key;
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-[11px] font-semibold ${
                  active ? "bg-saffron-600 text-white" : "text-slate-300 bg-navy-800/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
