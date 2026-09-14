// Builds the full "Project Details / Case Study" dataset for a single
// project row. Every seed/uploaded/backend project only carries the flat
// tracking fields (budget, progress, delay, milestones counts) — this module
// derives the richer narrative sections (scope, root cause, highlights,
// testimonials, team, milestone timeline) from those numbers so the detail
// view works for ANY project without requiring new backend fields.
//
// If a project does carry a `caseStudy` object (hand-authored, e.g. added in
// sampleProjects.js or returned by the backend), those fields always win —
// this engine only fills in what's missing. That keeps the detail view
// dynamic: richer data in, richer view out, with sensible defaults either way.

const SECTOR_PROFILES = {
  Roads: {
    techStack: ["GIS route alignment", "IRC pavement design codes", "Traffic simulation modelling", "Drone progress surveys"],
    deliverables: ["Carriageway construction & pavement", "Bridges / grade separators", "Utility shifting & road furniture", "Final surfacing & commissioning"],
    scheduleRootCause: "land acquisition and right-of-way (ROW) clearance running behind the construction front, forcing contractors to work in disconnected stretches",
    delayRootCause: "utility shifting (power/telecom lines) and monsoon-affected earthwork stalling the critical path",
    milestoneTitles: ["Land acquisition & ROW clearance", "Earthwork & sub-base", "Pavement & structures", "Utility shifting & road furniture", "Final surfacing & commissioning"],
    contractorLabel: "Civil Works Contractor (EPC)",
  },
  Railways: {
    techStack: ["Track-laying & ballast machinery", "Signal & Telecom (S&T) systems", "BIM corridor modelling", "Satellite progress imagery"],
    deliverables: ["Track laying & ballasting", "Signalling & electrification", "Stations / terminals", "Systems integration & trials"],
    scheduleRootCause: "geological / geotechnical surprises in tunnelling and viaduct sections that were not fully captured in the original DPR",
    delayRootCause: "muck disposal permissions and contractor mobilisation lagging the approved schedule",
    milestoneTitles: ["Alignment & geotechnical survey", "Earthwork, bridges & tunnels", "Track laying & ballasting", "Signalling & electrification", "Systems trials & commissioning"],
    contractorLabel: "Rail Systems Contractor",
  },
  Power: {
    techStack: ["SCADA grid monitoring", "GIS asset mapping", "Smart metering pilots", "Remote sensing for line surveys"],
    deliverables: ["Substation / generation infrastructure", "Transmission & distribution lines", "Metering & grid automation", "Commissioning & load testing"],
    scheduleRootCause: "equipment supply-chain lead times (transformers, cabling) running longer than the procurement schedule assumed",
    delayRootCause: "forest / right-of-way clearances for transmission corridors taking longer than budgeted",
    milestoneTitles: ["Site & route survey", "Civil & foundation works", "Equipment installation", "Transmission line stringing", "Testing & grid synchronisation"],
    contractorLabel: "EPC / Equipment Supplier",
  },
  "Urban Infrastructure": {
    techStack: ["GIS-based utility mapping", "IoT sensors (water/traffic)", "BIM for structures", "Citizen grievance dashboard"],
    deliverables: ["Core civil infrastructure", "Utility networks (water/sewage/power)", "Public amenities & landscaping", "Handover to municipal body"],
    scheduleRootCause: "multiple parallel civic agencies (water board, power utility, municipal corporation) needing sequenced NOCs before work fronts could open",
    delayRootCause: "congested urban right-of-way and traffic diversion approvals slowing the work front",
    milestoneTitles: ["Utility mapping & NOCs", "Core civil works", "Utility network laying", "Public amenities & landscaping", "Municipal handover"],
    contractorLabel: "Urban Infrastructure Contractor",
  },
  Waterways: {
    techStack: ["Hydrographic surveying", "Dredging telemetry", "GIS navigation charting", "Satellite water-level monitoring"],
    deliverables: ["Terminal / jetty civil works", "Dredging & channel development", "Navigation aids & signage", "Cargo handling systems"],
    scheduleRootCause: "seasonal river-flow / siltation patterns limiting the dredging and in-water construction window",
    delayRootCause: "environmental clearances for dredging and in-water works taking longer than planned",
    milestoneTitles: ["Hydrographic survey & clearances", "Dredging & channel works", "Terminal civil construction", "Navigation aids installation", "Trial operations & handover"],
    contractorLabel: "Marine / Dredging Contractor",
  },
  Irrigation: {
    techStack: ["GIS canal network mapping", "Remote-sensing crop-water assessment", "SCADA for canal gates", "Satellite reservoir monitoring"],
    deliverables: ["Dam / headworks construction", "Canal network & lining", "Lift irrigation & pumping systems", "Command area development"],
    scheduleRootCause: "monsoon-dependent construction windows and rehabilitation & resettlement (R&R) of affected families running behind plan",
    delayRootCause: "inter-state water-sharing clearances and R&R packages taking longer to finalise than scheduled",
    milestoneTitles: ["Survey & R&R clearances", "Headworks / dam construction", "Canal network & lining", "Pumping / lift systems", "Command area commissioning"],
    contractorLabel: "Irrigation Works Contractor",
  },
  default: {
    techStack: ["GIS-based project mapping", "Digital progress monitoring dashboard", "Drone/satellite progress surveys", "Centralised document management"],
    deliverables: ["Core construction / installation works", "Systems integration", "Quality & compliance testing", "Final commissioning & handover"],
    scheduleRootCause: "approvals and clearances from allied agencies running behind the planned schedule",
    delayRootCause: "contractor mobilisation and site-readiness issues slowing the work front",
    milestoneTitles: ["Planning & clearances", "Site mobilisation", "Core execution", "Testing & quality checks", "Commissioning & handover"],
    contractorLabel: "Executing Agency",
  },
};

function getProfile(sector) {
  return SECTOR_PROFILES[sector] || SECTOR_PROFILES.default;
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Same weighting as utils/riskEngine.js / RiskDetailModal, kept in sync so
// the root-cause section always explains the same score shown on the badge.
function riskBreakdown(project) {
  const budgetCr = num(project.budget_cr);
  const budgetUtilizedCr = num(project.budget_utilized_cr);
  const physicalPct = num(project.physical_progress_pct);
  const schedulePct = num(project.schedule_progress_pct);
  const delayMonths = num(project.delay_months);

  const budgetUtilizedPct = budgetCr ? (budgetUtilizedCr / budgetCr) * 100 : 0;
  const costVariance = budgetUtilizedPct - physicalPct;
  const scheduleVariance = schedulePct - physicalPct;

  return {
    budgetCr,
    budgetUtilizedCr,
    physicalPct,
    schedulePct,
    delayMonths,
    budgetUtilizedPct,
    costVariance,
    scheduleVariance,
    costActive: costVariance > 0,
    scheduleActive: scheduleVariance > 0,
    delayActive: delayMonths > 0,
  };
}

function deriveBudgetStatus(b) {
  if (b.costVariance > 15) return { label: "Overrun Risk", tone: "critical" };
  if (b.costVariance > 5) return { label: "Watch", tone: "moderate" };
  return { label: "On Budget", tone: "good" };
}

function deriveTimelineStatus(b) {
  if (b.delayMonths >= 5 || b.scheduleVariance > 20) return { label: "Critical Delay", tone: "critical" };
  if (b.delayMonths >= 1.5 || b.scheduleVariance > 8) return { label: "Delayed", tone: "moderate" };
  return { label: "On Track", tone: "good" };
}

function deriveRootCauses(project, b, profile) {
  const causes = [];

  if (b.scheduleActive) {
    causes.push({
      id: "schedule",
      title: "Physical progress trailing the approved schedule",
      detail: `Schedule expects ${b.schedulePct.toFixed(0)}% complete by now; physical progress on the ground is ${b.physicalPct.toFixed(0)}%.`,
      rootCause: `Most commonly traced to ${profile.scheduleRootCause}.`,
      mitigation: "Weekly work-front review with the executing agency, escalation of pending clearances to the nodal ministry, and re-sequencing of work packages that don't depend on the blocked front.",
    });
  }

  if (b.costActive) {
    causes.push({
      id: "cost",
      title: "Expenditure running ahead of certified physical work",
      detail: `${b.budgetUtilizedPct.toFixed(0)}% of sanctioned budget utilised against ${b.physicalPct.toFixed(0)}% physical progress.`,
      rootCause: "Typically driven by advance mobilisation payments, price escalation on materials, or milestone billing that isn't strictly tied to measured completion.",
      mitigation: "Third-party quality & quantity audit before releasing the next instalment, and aligning future payments strictly to measured (not claimed) physical completion.",
    });
  }

  if (b.delayActive) {
    causes.push({
      id: "delay",
      title: `${b.delayMonths} month(s) behind the original timeline`,
      detail: "Delay logged against the project's original sanctioned timeline.",
      rootCause: `Root cause on comparable projects is usually ${profile.delayRootCause}.`,
      mitigation: "Formal delay-cause registration, contractor performance review, and where justified, a time extension with revised milestone dates rather than an unmanaged slip.",
    });
  }

  return causes;
}

function deriveHighlights(project, b, profile) {
  const highlights = [];
  const milestoneRatio = project.milestones_total
    ? num(project.milestones_completed) / num(project.milestones_total)
    : 0;

  if (!b.costActive) {
    highlights.push({
      title: "Cost-efficient delivery",
      detail: "Budget utilisation is tracking at or below physical progress — spend is being converted into delivered work, not idle drawdown.",
    });
  }
  if (!b.scheduleActive) {
    highlights.push({
      title: "On pace with the planned schedule",
      detail: "Physical progress is matching or ahead of what the approved schedule expects at this stage.",
    });
  }
  if (milestoneRatio >= 0.5) {
    highlights.push({
      title: "Strong milestone execution",
      detail: `${project.milestones_completed} of ${project.milestones_total} milestones already certified complete, showing consistent delivery cadence.`,
    });
  }
  highlights.push({
    title: "Clear governance structure",
    detail: `Execution follows a defined ${profile.contractorLabel.toLowerCase()} model with milestone-based certification, keeping accountability traceable back to the ${project.ministry || "nodal ministry"}.`,
  });
  highlights.push({
    title: "Design fit for the sector",
    detail: `The work breakdown (${profile.deliverables[0].toLowerCase()} through to ${profile.deliverables[profile.deliverables.length - 1].toLowerCase()}) mirrors what has worked on comparable ${project.sector || "infrastructure"} projects, reducing execution risk from scope ambiguity.`,
  });

  return highlights;
}

function deriveMilestones(project, profile) {
  const total = Math.max(num(project.milestones_total, profile.milestoneTitles.length), 1);
  const completed = Math.min(num(project.milestones_completed, 0), total);
  const titles = profile.milestoneTitles;

  return Array.from({ length: total }, (_, i) => {
    const title = titles[Math.min(i, titles.length - 1)] + (total > titles.length ? ` — Package ${i + 1}` : "");
    return {
      id: `m-${i + 1}`,
      index: i + 1,
      title,
      completed: i < completed,
    };
  });
}

function defaultTestimonial(project, budgetStatus, timelineStatus) {
  if (timelineStatus.tone === "critical") {
    return {
      quote:
        "We've flagged the schedule slippage to the executing agency and are tightening the review cadence — the physical work that has landed is solid, it's the pace that needs to close the gap.",
      author: `Monitoring Cell, ${project.ministry || "Nodal Ministry"}`,
    };
  }
  return {
    quote:
      "Physical progress reported on the ground has consistently matched what's certified on paper, and milestone sign-offs have stayed on a predictable cadence.",
    author: `Project Monitoring Unit, ${project.ministry || "Nodal Ministry"}`,
  };
}

function defaultTeam(project, profile) {
  return [
    { role: "Nodal Ministry", name: project.ministry || "—" },
    { role: "Executing Agency", name: profile.contractorLabel },
    { role: "State Implementing Authority", name: project.state ? `${project.state} PWD / Implementing Dept.` : "—" },
    { role: "Monitoring & Evaluation", name: "PRAGATI Monitoring Cell" },
  ];
}

export function buildCaseStudy(project) {
  const profile = getProfile(project.sector);
  const b = riskBreakdown(project);
  const budgetStatus = deriveBudgetStatus(b);
  const timelineStatus = deriveTimelineStatus(b);
  const override = project.caseStudy || {};

  return {
    objectives:
      override.objectives ||
      `Deliver ${(project.sector || "the sanctioned").toLowerCase()} infrastructure at ${project.state || "the project site"} within the sanctioned ₹${b.budgetCr.toLocaleString("en-IN")} Cr budget, on the approved schedule, to the design specifications cleared by ${project.ministry || "the nodal ministry"}.`,
    techStack: override.techStack || profile.techStack,
    deliverables: override.deliverables || profile.deliverables,
    budgetStatus,
    timelineStatus,
    budgetUtilizedPct: b.budgetUtilizedPct,
    physicalPct: b.physicalPct,
    schedulePct: b.schedulePct,
    delayMonths: b.delayMonths,
    rootCauses: override.rootCauses || deriveRootCauses(project, b, profile),
    highlights: override.highlights || deriveHighlights(project, b, profile),
    testimonial: override.testimonial || defaultTestimonial(project, budgetStatus, timelineStatus),
    team: override.team || defaultTeam(project, profile),
    milestones: override.milestones || deriveMilestones(project, profile),
    attachments: override.attachments || [],
  };
}
