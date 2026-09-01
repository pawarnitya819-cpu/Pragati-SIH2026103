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
import { useIsMobile } from "../utils/useIsMobile";

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-4 sm:p-5">
      <p className="font-display font-bold text-navy-900 text-base">{title}</p>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

// On narrow screens a full-width chart squishes the axis and clips rotated
// tick labels. Rather than shrink, the chart keeps a readable minimum width
// and the card scrolls it horizontally. `minWidth` is 0 (i.e. "100%") on
// desktop so nothing changes there.
function ScrollableChart({ minWidth, height, children }) {
  return (
    <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
      <div style={{ minWidth: minWidth || "100%", height }}>{children}</div>
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
          ₹{Number(p.value || 0).toLocaleString("en-IN")} Cr
        </p>
      ))}
    </div>
  );
}

// Sector names run long ("Urban Infrastructure", "Water Infrastructure"), and
// horizontal ticks at interval={0} collide and get clipped once there are more
// than four or five sectors. Rotating each label -45deg and anchoring it at
// its end keeps every sector readable no matter how many the filtered dataset
// produces; anything still too long for the reserved gutter is truncated with
// an ellipsis and the full name stays available as a native SVG tooltip.
function SectorTick({ x, y, payload, fontSize, maxChars }) {
  const full = String(payload?.value ?? "");
  const label = full.length > maxChars ? `${full.slice(0, maxChars - 1)}…` : full;

  return (
    <g transform={`translate(${x},${y + 6})`}>
      <text
        transform="rotate(-45)"
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#475569"
        fontSize={fontSize}
        fontWeight={500}
      >
        <title>{full}</title>
        {label}
      </text>
    </g>
  );
}

export default function ChartsSection({ kpis }) {
  const [barRef, barInView] = useInView();
  const [pieRef, pieInView] = useInView();
  const isMobile = useIsMobile();

  // Rotated labels need vertical room. Reserving it on the axis (`height`)
  // plus the chart's bottom margin is what stops the longest sector names
  // from being cut off at the base of the card.
  const axisHeight = isMobile ? 78 : 104;
  const chartHeight = isMobile ? 300 : 340;
  const tickFontSize = isMobile ? 9 : 11;
  const tickMaxChars = isMobile ? 14 : 22;

  // Give every bar ~64px so a dense sector list stays legible; the card
  // scrolls when that exceeds the viewport. No minimum on desktop.
  const barCount = kpis.sectorBudget?.length ?? 0;
  const barMinWidth = isMobile ? Math.max(320, barCount * 64) : 0;
  const pieMinWidth = isMobile ? 280 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3" ref={barRef}>
        <ChartCard
          title="Sector-wise Budget Distribution"
          subtitle="Sanctioned outlay (₹ Cr) by infrastructure sector"
        >
          {barInView ? (
            <ScrollableChart minWidth={barMinWidth} height={chartHeight}>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={kpis.sectorBudget}
                  margin={{ top: 8, right: 12, left: -8, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="sector"
                    interval={0}
                    height={axisHeight}
                    tickMargin={4}
                    tickLine={false}
                    tick={<SectorTick fontSize={tickFontSize} maxChars={tickMaxChars} />}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} width={64} />
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
            </ScrollableChart>
          ) : (
            <div style={{ height: chartHeight }} />
          )}
        </ChartCard>
      </div>

      <div className="lg:col-span-2" ref={pieRef}>
        <ChartCard
          title="Delay-Risk Breakdown"
          subtitle="AI-classified overrun risk across all monitored projects"
        >
          {pieInView ? (
            <ScrollableChart minWidth={pieMinWidth} height={chartHeight}>
              <ResponsiveContainer width="100%" height={chartHeight}>
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
            </ScrollableChart>
          ) : (
            <div style={{ height: chartHeight }} />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
