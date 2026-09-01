import axios from "axios";

export const API_BASE = "https://pragati-sih2026103.onrender.com/api";

const client = axios.create({ baseURL: API_BASE, timeout: 8000 });

export async function fetchProjects() {
  const { data } = await client.get("/projects");
  return data;
}

export async function fetchKpis() {
  const { data } = await client.get("/kpis");
  return data;
}

// Uploads a File object to the FastAPI backend, which parses it with pandas,
// runs the risk engine, and returns the newly added rows plus the full
// updated dataset and KPI summary. `onProgress` receives 0-100 for the upload
// leg so the UI can show a real transfer bar before the server-side parse.
export async function uploadDataset(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!onProgress || !evt.total) return;
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

// Minimal client-side CSV parser used as a fallback demo path when the
// FastAPI backend isn't running — lets the "Process & Sync" flow still work
// end-to-end for judges who only want to click through the frontend.
export function parseCsvClientSide(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line, idx) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = { id: `upload-${Date.now()}-${idx}` };
    headers.forEach((h, i) => {
      const numeric = [
        "budget_cr",
        "budget_utilized_cr",
        "physical_progress_pct",
        "schedule_progress_pct",
        "delay_months",
        "milestones_total",
        "milestones_completed",
      ];
      row[h] = numeric.includes(h) ? Number(cells[i]) : cells[i];
    });
    return row;
  });
}
