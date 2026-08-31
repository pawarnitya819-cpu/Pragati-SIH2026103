import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

const STYLES = {
  "On Track": {
    classes: "bg-success-500/10 text-success-600 ring-1 ring-inset ring-success-500/30",
    Icon: CheckCircle2,
  },
  "Moderate Risk": {
    classes: "bg-saffron-600/10 text-saffron-600 ring-1 ring-inset ring-saffron-600/30",
    Icon: AlertTriangle,
  },
  "Critical Risk": {
    classes: "bg-alert-600/10 text-alert-600 ring-1 ring-inset ring-alert-600/30",
    Icon: ShieldAlert,
  },
};

export default function RiskBadge({ status, score, size = "sm" }) {
  const style = STYLES[status] || STYLES["On Track"];
  const { classes, Icon } = style;
  const pad = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${pad} ${classes}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2.5} />
      {status}
      {typeof score === "number" && (
        <span className="opacity-70 font-mono font-medium">· {score}</span>
      )}
    </span>
  );
}
