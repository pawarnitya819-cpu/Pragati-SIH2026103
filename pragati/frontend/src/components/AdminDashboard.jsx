import { useMemo, useState } from "react";
import SearchFilterBar from "./SearchFilterBar";
import ProjectTable from "./ProjectTable";
import InsightsPanel from "./InsightsPanel";
import KPICards from "./KPICards";
import { computeKpis } from "../utils/riskEngine";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboard({ projects }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [state, setState] = useState("All");

  const sectors = useMemo(() => [...new Set(projects.map((p) => p.sector))].sort(), [projects]);
  const states = useMemo(() => [...new Set(projects.map((p) => p.state))].sort(), [projects]);

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
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-navy-700" />
        <div>
          <h2 className="font-display font-black text-2xl text-navy-900">
            Government Dashboard
          </h2>
          <p className="text-slate-500 text-sm">
            Full project register with AI-generated overrun risk status, for internal review by
            nodal ministry officials.
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProjectTable projects={filtered} />
        </div>
        <div className="xl:col-span-1">
          <InsightsPanel projects={filtered.length ? filtered : projects} />
        </div>
      </div>
    </div>
  );
}
