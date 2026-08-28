// Lightweight delay-risk model — mirrors backend/main.py's compute_risk().
// Combines a cost-variance signal (money spent vs physical work delivered)
// with a schedule-variance signal (planned schedule vs physical work
// delivered) and a raw delay penalty into one 0-100 risk score, then buckets
// it into a status tag. This keeps the UI reactive even before a network
// round-trip returns, and lets uploaded rows get scored instantly client-side
// for the live-update demo, with the backend as the source of truth.

export function computeRisk({
  budget_cr,
  budget_utilized_cr,
  physical_progress_pct,
  schedule_progress_pct,
  delay_months,
}) {
  const budgetUtilizedPct = budget_cr ? (budget_utilized_cr / budget_cr) * 100 : 0;
  const costVariance = budgetUtilizedPct - physical_progress_pct;
  const scheduleVariance = schedule_progress_pct - physical_progress_pct;
  const delayPenalty = Math.min(delay_months * 6, 40);

  const raw =
    Math.max(costVariance, 0) * 0.6 + Math.max(scheduleVariance, 0) * 0.6 + delayPenalty;

  const riskScore = Math.round(Math.min(Math.max(raw, 0), 100) * 10) / 10;

  let riskStatus = "On Track";
  if (riskScore >= 55) riskStatus = "Critical Risk";
  else if (riskScore >= 25) riskStatus = "Moderate Risk";

  return { risk_score: riskScore, risk_status: riskStatus };
}

export function scoreProject(project) {
  if (project.risk_status) return project; // already scored (e.g. from backend)
  return { ...project, ...computeRisk(project) };
}

export function scoreProjects(projects) {
  return projects.map(scoreProject);
}

export function computeKpis(projects) {
  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget_cr || 0), 0);
  const highRisk = projects.filter((p) => p.risk_status === "Critical Risk").length;
  const moderateRisk = projects.filter((p) => p.risk_status === "Moderate Risk").length;
  const onTrack = projects.filter((p) => p.risk_status === "On Track").length;
  const milestonesCompleted = projects.reduce(
    (sum, p) => sum + Number(p.milestones_completed || 0),
    0
  );
  const milestonesTotal = projects.reduce(
    (sum, p) => sum + Number(p.milestones_total || 0),
    0
  );

  const sectorBudgetMap = {};
  projects.forEach((p) => {
    sectorBudgetMap[p.sector] = (sectorBudgetMap[p.sector] || 0) + Number(p.budget_cr || 0);
  });
  const sectorBudget = Object.entries(sectorBudgetMap).map(([sector, budget]) => ({
    sector,
    budget: Math.round(budget),
  }));

  const riskBreakdown = [
    { name: "On Track", value: onTrack, color: "#16A34A" },
    { name: "Moderate Risk", value: moderateRisk, color: "#D97706" },
    { name: "Critical Risk", value: highRisk, color: "#DC2626" },
  ];

  return {
    totalProjects,
    totalBudget: Math.round(totalBudget),
    highRisk,
    moderateRisk,
    onTrack,
    milestonesCompleted,
    milestonesTotal,
    sectorBudget,
    riskBreakdown,
  };
}
