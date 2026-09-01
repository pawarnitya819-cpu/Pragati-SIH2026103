import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchFilterBar({
  query,
  setQuery,
  sector,
  setSector,
  state,
  setState,
  sectors,
  states,
}) {
  return (
    <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by name or ministry..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700/40 focus:border-navy-700"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <SlidersHorizontal className="h-4 w-4 text-slate-400 hidden sm:block shrink-0" />
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="flex-1 min-w-0 sm:flex-none py-2.5 pl-3 pr-8 rounded-lg border border-slate-200 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-700/40 bg-white"
        >
          <option value="All">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="flex-1 min-w-0 sm:flex-none py-2.5 pl-3 pr-8 rounded-lg border border-slate-200 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-700/40 bg-white"
        >
          <option value="All">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
