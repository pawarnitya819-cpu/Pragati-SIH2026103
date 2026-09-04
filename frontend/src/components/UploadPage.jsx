import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  LogOut,
} from "lucide-react";
import { uploadDataset, parseCsvClientSide } from "../api";
import { scoreProjects, dedupeProjects } from "../utils/riskEngine";
import SiteMediaUpload from "./SiteMediaUpload";
import AuthModal from "./AuthModal";
import ParticleBackground from "./ParticleBackground";

const ACCEPTED_EXT = [".csv", ".xlsx", ".xls"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const EXPECTED_COLUMNS = [
  "name",
  "ministry",
  "sector",
  "state",
  "budget_cr",
  "budget_utilized_cr",
  "physical_progress_pct",
  "schedule_progress_pct",
  "delay_months",
  "milestones_total",
  "milestones_completed",
];

export default function UploadPage({ onDatasetSynced, siteMedia = [], onSiteMediaChange }) {
  const [authorized, setAuthorized] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [phase, setPhase] = useState("uploading"); // uploading | analyzing  (while status === processing)
  const [uploadPct, setUploadPct] = useState(0);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const isValidType = (f) =>
    f && ACCEPTED_EXT.some((ext) => f.name.toLowerCase().endsWith(ext));

  const handleFile = (f) => {
    if (!f) return;
    if (!isValidType(f)) {
      setFile(null);
      setStatus("error");
      setMessage("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFile(null);
      setStatus("error");
      setMessage(
        `"${f.name}" is ${(f.size / (1024 * 1024)).toFixed(1)} MB — the limit is 10 MB. Split the dataset and upload in parts.`
      );
      return;
    }
    setFile(f);
    setStatus("idle");
    setUploadPct(0);
    setMessage("");
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
    setUploadPct(0);
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // IMPORTANT: all hooks (useCallback included) must be called before any
  // early return, so this is placed here rather than further down the file.
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleAuthSuccess = (token) => {
    setAuthToken(token);
    setAuthorized(true);
  };

  const handleLogout = () => {
    setAuthorized(false);
    setAuthToken(null);
    setFile(null);
    setStatus("idle");
    setUploadPct(0);
    setMessage("");
  };

  if (!authorized) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={handleAuthSuccess}
        api={{
          verifyAccess: async (email, password) => {
            const { verifyAccess } = await import("../api");
            return verifyAccess(email, password);
          },
          registerUser: async (email, password, projectId) => {
            const { registerUser } = await import("../api");
            return registerUser(email, password, projectId);
          },
          forgotPassword: async (email) => {
            const { forgotPassword } = await import("../api");
            return forgotPassword(email);
          },
          resetPassword: async (resetToken, newPassword) => {
            const { resetPassword } = await import("../api");
            return resetPassword(resetToken, newPassword);
          },
        }}
      />
    );
  }

  const processAndSync = async () => {
    if (!file || status === "processing") return;
    setStatus("processing");
    setPhase("uploading");
    setUploadPct(0);
    setMessage("Uploading dataset…");

    try {
      // Preferred path: FastAPI backend parses with pandas + computes risk.
      const result = await uploadDataset(file, authToken, (pct) => {
        setUploadPct(pct);
        if (pct >= 100) {
          setPhase("analyzing");
          setMessage("Parsing rows and computing AI overrun risk…");
        }
      });
      onDatasetSynced(result.projects);
      setStatus("success");
      setMessage(result.message || `Synced ${result.added?.length ?? 0} project record(s).`);
    } catch (err) {
      // Fallback path: parse CSV client-side so the demo still works if the
      // FastAPI server isn't running (e.g. judges only launched the frontend).
      if (file.name.toLowerCase().endsWith(".csv")) {
        try {
          setPhase("analyzing");
          setMessage("Backend unreachable — parsing client-side…");
          const text = await file.text();
          const rows = parseCsvClientSide(text);
          if (!rows.length) {
            setStatus("error");
            setMessage("No data rows found in the file. Check that it has a header row plus at least one record.");
            return;
          }
          const scored = scoreProjects(dedupeProjects(rows));
          onDatasetSynced((prev) => [...prev, ...scored]);
          setStatus("success");
          setMessage(
            `Backend unreachable — parsed ${scored.length} row(s) client-side instead. Start the FastAPI server for full functionality.`
          );
          return;
        } catch (parseErr) {
          // fall through to generic error below
        }
      }
      setStatus("error");
      setMessage(
        err?.response?.data?.detail ||
          "Could not process file. The backend may still be waking up — wait a few seconds and try again."
      );
    }
  };

  const processing = status === "processing";

  return (
    <div className="relative">
      <ParticleBackground />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-navy-900">Data Ingestion</h2>
            <p className="text-slate-500 text-sm mt-1">
              Field engineers and nodal officials can upload progress datasets here. Records are
              parsed, scored for overrun risk, and merged into the live monitoring register.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!processing) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            if (processing) {
              e.preventDefault();
              return;
            }
            onDrop(e);
          }}
          onClick={() => !processing && inputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-colors bg-white ${
            processing
              ? "cursor-not-allowed border-slate-200 opacity-60"
              : dragActive
              ? "cursor-pointer border-saffron-600 bg-saffron-100/40"
              : "cursor-pointer border-slate-300 hover:border-navy-700"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-navy-900/5 flex items-center justify-center">
              <UploadCloud className="h-7 w-7 text-navy-700" strokeWidth={2} />
            </div>
            <p className="font-semibold text-navy-900">
              Drag &amp; drop your CSV / Excel dataset here
            </p>
            <p className="text-sm text-slate-500">
              or click to browse — .csv, .xlsx, .xls · up to 10 MB
            </p>
          </div>
        </div>

        {!file && status === "idle" && (
          <p className="text-xs text-slate-400 text-center -mt-2">
            No dataset selected yet. Your upload is validated against the expected columns before it syncs.
          </p>
        )}

        {file && (
          <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-navy-700 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                    {status === "success" && " · synced"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!processing && status !== "success" && (
                  <button
                    onClick={clearFile}
                    aria-label="Remove selected file"
                    title="Remove selected file"
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-alert-600 hover:bg-alert-600/10 flex items-center justify-center transition-colors"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                )}
                <button
                  onClick={status === "success" ? clearFile : processAndSync}
                  disabled={processing}
                  className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {processing
                    ? phase === "uploading"
                      ? `Uploading… ${uploadPct}%`
                      : "Analysing…"
                    : status === "success"
                    ? "Upload another"
                    : "Process & Sync Dataset"}
                </button>
              </div>
            </div>

            {processing && (
              <div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-navy-700 transition-[width] duration-300 ease-out ${
                      phase === "analyzing" ? "animate-pulse" : ""
                    }`}
                    style={{ width: phase === "analyzing" ? "100%" : `${uploadPct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  {phase === "uploading"
                    ? `Transferring file — ${uploadPct}%`
                    : "File received. Parsing rows and scoring overrun risk on the server…"}
                </p>
              </div>
            )}
          </div>
        )}

        {status !== "idle" && message && !processing && (
          <div
            className={`rounded-xl p-4 flex items-start gap-3 text-sm ${
              status === "success"
                ? "bg-success-500/10 text-success-600 ring-1 ring-success-500/20"
                : status === "error"
                ? "bg-alert-600/10 text-alert-600 ring-1 ring-alert-600/20"
                : "bg-navy-900/5 text-navy-800"
            }`}
          >
            {status === "success" && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
            {status === "error" && <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            <p className="min-w-0">{message}</p>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Expected columns
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EXPECTED_COLUMNS.map((col) => (
              <code
                key={col}
                className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-600"
              >
                {col}
              </code>
            ))}
          </div>
          <a
            href="/sample_upload.csv"
            download
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-navy-700 hover:text-navy-900"
          >
            <Download className="h-3.5 w-3.5" />
            Download sample_upload.csv
          </a>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <SiteMediaUpload
            projectId="pragati-upload"
            items={siteMedia}
            onChange={onSiteMediaChange}
          />
        </div>
      </div>
    </div>
  );
}
