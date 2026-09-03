import { useMemo, useState } from "react";
import KPICards from "./KPICards";
import ChartsSection from "./ChartsSection";
import SearchFilterBar from "./SearchFilterBar";
import ProjectTable from "./ProjectTable";
import { computeKpis } from "../utils/riskEngine";

export default function LandingPage({ projects }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [state, setState] = useState("All");

  const sectors = useMemo(
    () => [...new Set(projects.map((p) => p.sector))].sort(),
    [projects]
  );
  const states = useMemo(
    () => [...new Set(projects.map((p) => p.state))].sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.ministry.toLowerCase().includes(query.toLowerCase());
      const matchesSector = sector === "All" || p.sector === sector;
      const matchesState = state === "All" || p.state === state;
      return matchesQuery && matchesSector && matchesState;
    });
  }, [projects, query, sector, state]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <section className="bg-navy-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Ashoka Chakra badge — fixed in the empty space of the hero
            banner, continuously rotating in place. Rendered in the flag's
            real colors (navy spokes on a white disc) so it reads clearly
            against the dark background instead of blending into it. */}
        <div className="hidden md:block absolute top-1/2 right-6 sm:right-8 -translate-y-1/2 h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40">
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className="h-full w-full drop-shadow-lg animate-[spin_18s_linear_infinite]"
          >
            <circle cx="100" cy="100" r="98" fill="white" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="#0B1F3A" strokeWidth="4" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="16"
                  stroke="#0B1F3A"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 100 100)`}
                />
              );
            })}
            <circle cx="100" cy="100" r="12" fill="#0B1F3A" />
          </svg>
        </div>

        <div className="relative">
          <p className="text-saffron-500 font-mono text-xs uppercase tracking-widest mb-2">
            Ministry of Statistics and Programme Implementation
          </p>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white max-w-2xl leading-tight">
            PRAGATI: Unified Infrastructure Project Monitoring
          </h1>
          <p className="mt-3 text-slate-300 max-w-2xl text-sm sm:text-base">
            A single, AI-assisted view into central infrastructure execution — tracking budget
            utilisation, physical progress, and overrun risk across roads, railways, power,
            urban infrastructure, and waterways projects nationwide.
          </p>
        </div>
      </section>

            <section className="bg-white rounded-2xl p-6 ring-1 ring-slate-900/5 shadow-card">
        <h2 className="font-display font-black text-lg text-navy-900 mb-2">
          What is PRAGATI?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          <strong>PRAGATI</strong> (Pro-Active Governance and Timely Implementation) is a
          dashboard that tracks big government infrastructure projects — like highways,
          railways, and power plants — happening across India. It shows how much money has
          been spent, how much work is actually done on the ground, and flags any project
          that's falling behind schedule or going over budget.
        </p>
      </section>

      <KPICards kpis={kpis} />

      <SearchFilterBar
        query={query}
        setQuery={setQuery}
        sector={sector}
        setSector={setSector}
        state={state}
        setState={setState}
        sectors={sectors}
        states={states}
      />

      <ChartsSection kpis={kpis} />

      <ProjectTable projects={filtered} />
    </div>
  );
}
