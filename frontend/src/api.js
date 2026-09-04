import axios from "axios";

export const API_BASE = "https://pragati-sih2026103.onrender.com/api";

const client = axios.create({ baseURL: API_BASE, timeout: 60000 });

export async function fetchProjects() {
  const { data } = await client.get("/projects");
  return data;
}

export async function fetchKpis() {
  const { data } = await client.get("/kpis");
  return data;
}

export async function verifyAccess(projectId, password) {
  const { data } = await client.post("/auth/verify", {
    project_id: projectId,
    password,
  });
  return data; // { token, expires_in }
}

export async function registerUser(email, password, projectId) {
  const { data } = await client.post("/auth/register", {
    email,
    password,
    project_id: projectId,
  });
  return data; // { message, email }
}

export async function forgotPassword(email) {
  const { data } = await client.post("/auth/forgot-password", {
    email,
  });
  return data; // { message, reset_token }
}

export async function resetPassword(resetToken, newPassword) {
  const { data } = await client.post("/auth/reset-password", {
    reset_token: resetToken,
    new_password: newPassword,
  });
  return data; // { message, token, expires_in }
}

export async function uploadDataset(file, token, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (evt) => {
      if (!onProgress || !evt.total) return;
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

export async function dedupeDataset(token) {
  const { data } = await client.post(
    "/dedupe",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function resetDataset(token) {
  const { data } = await client.delete("/reset", {
    headers: { Authorization: `Bearer ${token}` },
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
