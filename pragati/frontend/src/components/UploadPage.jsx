import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, Loader2, Download, Lock } from "lucide-react";
import { uploadDataset, parseCsvClientSide } from "../api";
import { scoreProjects } from "../utils/riskEngine";

const ACCEPTED_EXT = [".csv", ".xlsx", ".xls"];
const TEMP_UPLOAD_PASSWORD = "SIH@2026";

export default function UploadPage({ onDatasetSynced }) {
  const [authorized, setAuthorized] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const isValidFile = (f) =>
    f && ACCEPTED_EXT.some((ext) => f.name.toLowerCase().endsWith(ext));

  const handleFile = (f) => {
    if (!isValidFile(f)) {
      setStatus("error");
      setMessage("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
    setFile(f);
    setStatus("idle");
    setMessage("");
  };

  // IMPORTANT: all hooks (useCallback included) must be called before any
  // early return, so this is placed here rather than further down the file.
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!projectId.trim()) {
      setAuthError("Please enter a Project ID.");
      return;
    }
    if (password !== TEMP_UPLOAD_PASSWORD) {
      setAuthError("Incorrect password. Please try again.");
      return;
    }
    setAuthError("");
    setAuthorized(true);
  };

  if (!authorized) {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <form
          onSubmit={handleAuthSubmit}
          className="bg-white rounded-2xl shadow-card ring-1 ring-slate-900/5 p-6 space-y-4"
        >
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="h-12 w-12 rounded-full bg-navy-900/5 flex items-center justify-center">
              <Lock className="h-6 w-6 text-navy-700" strokeWidth={2} />
            </div>
            <h2 className="font-display font-black text-lg text-navy-900">Verify Access</h2>
            <p className="text-xs text-slate-500 text-center">
              Data uploads are restricted during evaluation. Enter your Project ID and access
              password to continue.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="e.g. SIH26103"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
            />
          </div>

          {authError && (
            <p className="text-xs text-alert-600 font-medium">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Unlock Upload
          </button>
        </form>
      </div>
    );
  }

  const processAndSync = async () => {
    if (!file) return;
    setStatus("processing");
    setMessage("Parsing dataset and computing AI overrun risk...");

    try {
      // Preferred path: FastAPI backend parses with pandas + computes risk.
      const result = await uploadDataset(file);
      onDatasetSynced(result.projects);
      setStatus("success");
      setMessage(result.message || `Synced ${result.added?.length ?? 0} project record(s).`);
    } catch (err) {
      // Fallback path: parse CSV client-side so the demo still works if the
      // FastAPI server isn't running (e.g. judges only launched the frontend).
      if (file.name.toLowerCase().endsWith(".csv")) {
        try {
          const text = await file.text();
          const rows = parseCsvClientSide(text);
          const scored = scoreProjects(rows);
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
          "Could not process file. Ensure the FastAPI backend is running on http://localhost:8000."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-navy-900">Data Ingestion</h2>
        <p className="text-slate-500 text-sm mt-1">
          Field engineers and nodal officials can upload progress datasets here. Records are
          parsed, scored for overrun risk, and merged into the live monitoring register.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors bg-white ${
          dragActive ? "border-saffron-600 bg-saffron-100/40" : "border-slate-300 hover:border-navy-700"
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
            Drag & drop your CSV / Excel dataset here
          </p>
          <p className="text-sm text-slate-500">or click to browse — .csv, .xlsx, .xls supported</p>
        </div>
      </div>

      {file && (
        <div className="bg-white rounded-xl shadow-card ring-1 ring-slate-900/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-navy-700" />
            <div>
              <p className="font-semibold text-navy-900 text-sm">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={processAndSync}
            disabled={status === "processing"}
            className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {status === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Process & Sync Dataset
          </button>
        </div>
      )}

      {status !== "idle" && message && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 text-sm ${
            status === "success"
              ? "bg-success-500/10 text-success-600"
              : status === "error"
              ? "bg-alert-600/10 text-alert-600"
              : "bg-navy-900/5 text-navy-800"
          }`}
        >
          {status === "success" && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
          {status === "error" && <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          {status === "processing" && <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />}
          <p>{message}</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Expected columns
        </p>
        <code className="block text-xs text-slate-600 overflow-x-auto whitespace-pre">
          name, ministry, sector, state, budget_cr, budget_utilized_cr,{"\n"}
          physical_progress_pct, schedule_progress_pct, delay_months,{"\n"}
          milestones_total, milestones_completed
        </code>
        <a
          href="/sample_upload.csv"
          download
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-navy-700 hover:text-navy-900"
        >
          <Download className="h-3.5 w-3.5" />
          Download sample_upload.csv
        </a>
      </div>
    </div>
  );
}