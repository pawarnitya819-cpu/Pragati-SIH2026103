/**
 * Utility functions to compute ministry/sector statistics from projects
 */

export function getMinistryStats(projects) {
  const stats = {};

  projects.forEach((p) => {
    const ministry = p.ministry || "Unassigned";
    if (!stats[ministry]) {
      stats[ministry] = {
        ministry,
        count: 0,
        budget: 0,
        onTrack: 0,
        moderate: 0,
        critical: 0,
      };
    }
    stats[ministry].count += 1;
    stats[ministry].budget += Number(p.budget_cr) || 0;

    // Count by risk level
    const riskScore = p.risk_score || 0;
    if (riskScore < 25) stats[ministry].onTrack += 1;
    else if (riskScore < 55) stats[ministry].moderate += 1;
    else stats[ministry].critical += 1;
  });

  return Object.values(stats).sort((a, b) => b.budget - a.budget);
}

export function getSectorStats(projects) {
  const stats = {};

  projects.forEach((p) => {
    const sector = p.sector || "Unclassified";
    if (!stats[sector]) {
      stats[sector] = {
        sector,
        count: 0,
        budget: 0,
        onTrack: 0,
        moderate: 0,
        critical: 0,
      };
    }
    stats[sector].count += 1;
    stats[sector].budget += Number(p.budget_cr) || 0;

    // Count by risk level
    const riskScore = p.risk_score || 0;
    if (riskScore < 25) stats[sector].onTrack += 1;
    else if (riskScore < 55) stats[sector].moderate += 1;
    else stats[sector].critical += 1;
  });

  return Object.values(stats).sort((a, b) => b.budget - a.budget);
}

/**
 * Map risk score to RGB color
 * Green: On Track (< 25)
 * Yellow: Moderate (25-54)
 * Red: Critical (>= 55)
 */
export function getRiskColor(riskScore) {
  if (riskScore < 25) return { r: 21, g: 128, b: 61 }; // #15803D Green
  if (riskScore < 55) return { r: 217, g: 119, b: 6 }; // #D97706 Yellow
  return { r: 220, g: 38, b: 38 }; // #DC2626 Red
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex({ r, g, b }) {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}
