import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useInView } from "../utils/useInView";

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-5">
      <p className="font-display font-bold text-navy-900 text-base">{title}</p>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-900 text-white text-xs rounded-md px-3 py-2 shadow-lg">
      <p className="font-semibold mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          ₹{p.value.toLocaleString("en-IN")} Cr
        </p>
      ))}
    </div>
  );
}

export default function ChartsSection({ kpis }) {
  const [barRef, barInView] = useInView();
  const [pieRef, pieInView] = useInView();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3" ref={barRef}>
        <ChartCard
          title="Sector-wise Budget Distribution"
          subtitle="Sanctioned outlay (₹ Cr) by infrastructure sector"
        >
          {barInView ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kpis.sectorBudget} margin={{ left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="sector"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  interval={0}
                  angle={0}
                  textAnchor="middle"
                  height={32}
                />
                <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F1F5F9" }} />
                <Bar
                  dataKey="budget"
                  fill="#1E3A8A"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={54}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280 }} />
          )}
        </ChartCard>
      </div>

      <div className="lg:col-span-2" ref={pieRef}>
        <ChartCard
          title="Delay-Risk Breakdown"
          subtitle="AI-classified overrun risk across all monitored projects"
        >
          {pieInView ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={kpis.riskBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={3}
                  animationDuration={1100}
                  animationEasing="ease-out"
                >
                  {kpis.riskBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: "#475569" }}
                />
                <Tooltip formatter={(v, n) => [`${v} project(s)`, n]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280 }} />
          )}
        </ChartCard>
      </div>
    </div>
  );
}