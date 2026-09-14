import { useEffect, useState } from "react";
import {
  X,
  LayoutGrid,
  HeartPulse,
  SearchCheck,
  Award,
  FileStack,
  Landmark,
  MapPin,
  Wallet,
  CalendarClock,
  CheckCircle2,
  Circle,
  Quote,
  Users,
  Paperclip,
  ShieldAlert,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import RiskBadge from "./RiskBadge";
import { buildCaseStudy } from "../utils/caseStudyEngine";
import { getStateLatLng } from "../data/stateCoordinates";

// Same fix as ProjectLocationMap.jsx — Leaflet's default marker icons don't
// resolve correctly under Vite's bundler without pointing them at the
// bundled image URLs manually. Safe to repeat: it's a no-op if
// ProjectLocationMap already ran it in this session.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const TABS = [
  { id: "overview", label: "Overview & Scope", Icon: LayoutGrid },
  { id: "health", label: "Health & Risk", Icon: HeartPulse },
  { id: "rootcause", label: "Root Cause", Icon: SearchCheck },
  { id: "highlights", label: "Highlights", Icon: Award },
  { id: "details", label: "Full Details", Icon: FileStack },
];

const TONE_STYLES = {
  good: "bg-success-500/10 text-success-600 ring-success-500/30",
  moderate: "bg-saffron-600/10 text-saffron-600 ring-saffron-600/30",
  critical: "bg-alert-600/10 text-alert-600 ring-alert-600/30",
};

function StatusPill({ label, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE_STYLES[tone]}`}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{children}</p>;
}

function OverviewTab({ project, cs }) {
  const loc = getStateLatLng(project.state);
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Core Objectives</SectionLabel>
        <p className="text-sm text-slate-700 leading-relaxed">{cs.objectives}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" /> Budget Status
          </p>
          <div className="mt-1.5"><StatusPill label={cs.budgetStatus.label} tone={cs.budgetStatus.tone} /></div>
          <p className="text-xs text-slate-500 mt-2">
            ₹{Number(project.budget_utilized_cr).toLocaleString("en-IN")} Cr used of ₹
            {Number(project.budget_cr).toLocaleString("en-IN")} Cr sanctioned
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" /> Timeline Status
          </p>
          <div className="mt-1.5"><StatusPill label={cs.timelineStatus.label} tone={cs.timelineStatus.tone} /></div>
          <p className="text-xs text-slate-500 mt-2">
            {cs.delayMonths > 0 ? `${cs.delayMonths} month(s) behind original timeline` : "No reported delay"}
          </p>
        </div>
      </div>

      <div>
        <SectionLabel>Tech Stack & Systems</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {cs.techStack.map((t) => (
            <span key={t} className="text-xs font-medium bg-navy-900/5 text-navy-900 rounded-md px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Key Deliverables</SectionLabel>
        <ul className="space-y-1.5">
          {cs.deliverables.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-navy-700 mt-0.5 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>Project Location</SectionLabel>
        <div className="rounded-xl overflow-hidden ring-1 ring-slate-100 h-[220px] w-full" data-lenis-prevent>
          <MapContainer
            center={[project.lat ?? loc.lat, project.lng ?? loc.lng]}
            zoom={6}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[project.lat ?? loc.lat, project.lng ?? loc.lng]}>
              <Popup>
                <strong>{project.name}</strong>
                <br />
                {project.state}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-navy-700 shrink-0" />
          {project.state} — approximate state-level location on real map data (OpenStreetMap).
        </p>
      </div>
    </div>
  );
}

function MetricBar({ label, pct, tone = "navy" }) {
  const barColor =
    tone === "alert" ? "#DC2626" : tone === "saffron" ? "#D97706" : tone === "success" ? "#15803D" : "#1E3A8A";
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-mono font-semibold text-navy-900">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function HealthTab({ project, cs }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <SectionLabel>AI Overrun Risk</SectionLabel>
          <p className="text-2xl font-display font-black text-navy-900">
            {project.risk_score}
            <span className="text-sm font-semibold text-slate-400"> / 100</span>
          </p>
        </div>
        <RiskBadge status={project.risk_status} size="lg" />
      </div>

      <div className="space-y-3">
        <MetricBar label="Physical progress" pct={cs.physicalPct} tone="navy" />
        <MetricBar label="Schedule expects" pct={cs.schedulePct} tone="saffron" />
        <MetricBar label="Budget utilised" pct={cs.budgetUtilizedPct} tone="success" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
          <p className="text-xs text-slate-500">Budget Status</p>
          <div className="mt-1.5"><StatusPill label={cs.budgetStatus.label} tone={cs.budgetStatus.tone} /></div>
        </div>
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
          <p className="text-xs text-slate-500">Timeline Status</p>
          <div className="mt-1.5"><StatusPill label={cs.timelineStatus.label} tone={cs.timelineStatus.tone} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
        <div className="pt-3">
          <p className="text-xs text-slate-500">Milestones completed</p>
          <p className="text-sm font-semibold text-navy-900 mt-0.5">
            {project.milestones_completed} / {project.milestones_total}
          </p>
        </div>
        <div className="pt-3">
          <p className="text-xs text-slate-500">Overall risk status</p>
          <p className="text-sm font-semibold text-navy-900 mt-0.5">{project.risk_status}</p>
        </div>
      </div>
    </div>
  );
}

function RootCauseTab({ cs }) {
  if (cs.rootCauses.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl p-4 bg-success-500/5 ring-1 ring-inset ring-success-500/15">
        <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 shrink-0" strokeWidth={2.5} />
        <div>
          <p className="text-sm font-semibold text-navy-900">No material risk factors identified</p>
          <p className="text-sm text-slate-600 mt-1">
            Spending, schedule, and delay signals are all in line with physical progress on the ground —
            there is currently no root cause analysis required for this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cs.rootCauses.map((rc) => (
        <div key={rc.id} className="rounded-xl ring-1 ring-inset ring-alert-600/15 bg-alert-600/5 p-4">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4.5 w-4.5 text-alert-600 mt-0.5 shrink-0" strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900">{rc.title}</p>
              <p className="text-xs text-slate-500 mt-1">{rc.detail}</p>
            </div>
          </div>
          <div className="mt-3 pl-7 space-y-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-alert-600">Likely Root Cause</p>
              <p className="text-sm text-slate-700 mt-0.5">{rc.rootCause}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-success-600">Mitigation Strategy</p>
              <p className="text-sm text-slate-700 mt-0.5">{rc.mitigation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HighlightsTab({ cs }) {
  return (
    <div className="space-y-2.5">
      {cs.highlights.map((h) => (
        <div key={h.title} className="flex items-start gap-3 rounded-xl p-3.5 bg-success-500/5 ring-1 ring-inset ring-success-500/15">
          <Award className="h-4 w-4 text-success-600 mt-0.5 shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-900">{h.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{h.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailsTab({ cs }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Client / Ministry Testimonial</SectionLabel>
        <div className="rounded-xl bg-navy-900/5 p-4 relative">
          <Quote className="h-5 w-5 text-navy-900/20 absolute top-3 right-3" />
          <p className="text-sm text-slate-700 italic leading-relaxed pr-6">"{cs.testimonial.quote}"</p>
          <p className="text-xs font-semibold text-navy-900 mt-2">— {cs.testimonial.author}</p>
        </div>
      </div>

      <div>
        <SectionLabel>Team Involvement</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cs.team.map((t) => (
            <div key={t.role} className="flex items-start gap-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
              <Users className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{t.role}</p>
                <p className="text-sm font-semibold text-navy-900 truncate" title={t.name}>{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Milestone Timeline</SectionLabel>
        <div className="space-y-1">
          {cs.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5 text-sm">
              {m.completed ? (
                <CheckCircle2 className="h-4 w-4 text-success-600 shrink-0" strokeWidth={2.5} />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 shrink-0" strokeWidth={2.5} />
              )}
              <span className={m.completed ? "text-navy-900 font-medium" : "text-slate-400"}>
                {m.index}. {m.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Attachments & Links</SectionLabel>
        {cs.attachments.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
            <Paperclip className="h-4 w-4 shrink-0" />
            No attachments uploaded for this project yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {cs.attachments.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-navy-700 hover:underline rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3"
              >
                <Paperclip className="h-4 w-4 shrink-0" />
                {a.label || a.url}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailModal({ project, onClose }) {
  const [tab, setTab] = useState("overview");

  // Lenis (see App.jsx) hijacks wheel/touch scroll on the whole document, so
  // without this, scrolling inside the modal was scrolling the page behind
  // it instead. Locking body scroll + marking the inner pane with
  // data-lenis-prevent (Lenis' own opt-out attribute) keeps the scroll
  // gesture contained to the modal.
  useEffect(() => {
    if (!project) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [project]);

  if (!project) return null;
  const cs = buildCaseStudy(project);

  return (
    <div
      className="fixed inset-0 z-[1200] bg-navy-900/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="bg-navy-900 text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-base font-display font-bold truncate" title={project.name}>{project.name}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> {project.ministry}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {project.state}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <RiskBadge status={project.risk_status} score={project.risk_score} />
            <button onClick={onClose} aria-label="Close project details" className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 pt-2 border-b border-slate-100 overflow-x-auto scrollbar-thin shrink-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                tab === id
                  ? "text-navy-900 bg-slate-50 ring-1 ring-b-0 ring-slate-100"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto scrollbar-thin flex-1" data-lenis-prevent>
          {tab === "overview" && <OverviewTab project={project} cs={cs} />}
          {tab === "health" && <HealthTab project={project} cs={cs} />}
          {tab === "rootcause" && <RootCauseTab cs={cs} />}
          {tab === "highlights" && <HighlightsTab cs={cs} />}
          {tab === "details" && <DetailsTab cs={cs} />}
        </div>
      </div>
    </div>
  );
}