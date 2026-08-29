// Approximate position of each Indian state/UT on the stylized map used by
// ProjectLocationMap.jsx. Values are percentages (0-100) within the map's
// viewBox, hand-calibrated to roughly match real relative geography.
// This is intentionally illustrative, not a precise cartographic dataset —
// projects only carry a state name, not exact coordinates.

export const STATE_POSITIONS = {
  "Jammu and Kashmir": { x: 38, y: 4 },
  "Jammu & Kashmir": { x: 38, y: 4 },
  "Ladakh": { x: 48, y: 2 },
  "Himachal Pradesh": { x: 40, y: 12 },
  "Punjab": { x: 33, y: 14 },
  "Chandigarh": { x: 36, y: 14 },
  "Uttarakhand": { x: 45, y: 15 },
  "Haryana": { x: 37, y: 18 },
  "Delhi": { x: 39, y: 19 },
  "Rajasthan": { x: 25, y: 28 },
  "Uttar Pradesh": { x: 48, y: 26 },
  "Bihar": { x: 60, y: 28 },
  "Sikkim": { x: 68, y: 22 },
  "Assam": { x: 78, y: 24 },
  "Arunachal Pradesh": { x: 82, y: 16 },
  "Nagaland": { x: 85, y: 26 },
  "Manipur": { x: 84, y: 30 },
  "Mizoram": { x: 80, y: 34 },
  "Tripura": { x: 76, y: 32 },
  "Meghalaya": { x: 76, y: 26 },
  "West Bengal": { x: 65, y: 36 },
  "Jharkhand": { x: 58, y: 38 },
  "Chhattisgarh": { x: 52, y: 45 },
  "Madhya Pradesh": { x: 42, y: 40 },
  "Gujarat": { x: 18, y: 42 },
  "Maharashtra": { x: 32, y: 54 },
  "Odisha": { x: 60, y: 50 },
  "Telangana": { x: 45, y: 60 },
  "Andhra Pradesh": { x: 48, y: 68 },
  "Karnataka": { x: 35, y: 68 },
  "Goa": { x: 27, y: 64 },
  "Kerala": { x: 32, y: 85 },
  "Tamil Nadu": { x: 42, y: 85 },
  "Puducherry": { x: 44, y: 82 },
};

// Fallback used when a project's state isn't in the table above
// (e.g. a typo in uploaded data), so the map never silently breaks.
export const DEFAULT_POSITION = { x: 45, y: 45 };

export function getStatePosition(stateName) {
  if (!stateName) return DEFAULT_POSITION;
  return STATE_POSITIONS[stateName.trim()] || DEFAULT_POSITION;
}