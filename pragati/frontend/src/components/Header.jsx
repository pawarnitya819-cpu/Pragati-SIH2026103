import { LandmarkIcon, UploadCloud, LayoutDashboard, Globe2 } from "lucide-react";

// Simplified national emblem badge (Ashoka Lion Capital + "Satyamev Jayate")
// rendered as inline SVG so it needs no external asset and scales cleanly at
// any header height.
function NationalEmblem({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="Emblem of India" role="img">
      <circle cx="32" cy="32" r="31" fill="#0A192F" stroke="#D97706" strokeWidth="1.5" />
      {/* Abacus / drum band with dharma chakras */}
      <rect x="14" y="38" width="36" height="5" rx="1" fill="#F5C99B" />
      {[20, 32, 44].map((cx) => (
        <circle key={cx} cx={cx} cy="40.5" r="2.1" fill="none" stroke="#0A192F" strokeWidth="0.9" />
      ))}
      {/* Bell-shaped abacus base */}
      <path d="M17 38 Q32 30 47 38 Z" fill="#F5C99B" />
      {/* Three lions, stylised front-facing silhouette */}
      <g fill="#F5C99B">
        <path d="M32 14c-3.4 0-6 2.6-6.2 5.8-1.1.4-1.9 1.4-1.9 2.6 0 .9.4 1.7 1.1 2.2-.3.5-.4 1.1-.4 1.7 0 2.3 2 4.1 4.6 4.4l-.9 3.7h7.4l-.9-3.7c2.6-.3 4.6-2.1 4.6-4.4 0-.6-.1-1.2-.4-1.7.7-.5 1.1-1.3 1.1-2.2 0-1.2-.8-2.2-1.9-2.6C38 16.6 35.4 14 32 14z" />
        <circle cx="29" cy="21.5" r="1" fill="#0A192F" />
        <circle cx="35" cy="21.5" r="1" fill="#0A192F" />
      </g>
      {/* Central chakra beneath the lions */}
      <circle cx="32" cy="35" r="2.4" fill="none" stroke="#0A192F" strokeWidth="1" />
      <text
        x="32"
        y="53.5"
        textAnchor="middle"
        fontSize="6.2"
        fontWeight="700"
        fill="#F5C99B"
        style={{ fontFamily: "serif" }}
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

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
            <NationalEmblem className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" />
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
