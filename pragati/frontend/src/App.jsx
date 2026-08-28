import { useEffect, useState } from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import AdminDashboard from "./components/AdminDashboard";
import { SEED_PROJECTS } from "./data/sampleProjects";
import { scoreProjects } from "./utils/riskEngine";
import { fetchProjects } from "./api";
import { WifiOff } from "lucide-react";

export default function App() {
  const [page, setPage] = useState("landing");
  const [projects, setProjects] = useState(() => scoreProjects(SEED_PROJECTS));
  const [backendOnline, setBackendOnline] = useState(true);

  // On load, try to sync with the FastAPI backend (which seeds the same 8
  // sample rows plus computes risk server-side). If it's not running, the
  // app keeps working off the hardcoded client-side seed data so the demo
  // never looks broken.
  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(scoreProjects(data));
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  // Accepts either a full replacement array (from the backend response,
  // which already includes seed + uploaded rows) or an updater function
  // (used by the client-side fallback parser in UploadPage).
  const handleDatasetSynced = (updater) => {
    setProjects((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return scoreProjects(next);
    });
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header page={page} setPage={setPage} />

      {!backendOnline && (
        <div className="bg-saffron-100 border-b border-saffron-600/30 text-saffron-600 text-xs font-medium px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          FastAPI backend not detected at localhost:8000 — running on pre-loaded sample data
          only. Uploads will use a client-side fallback parser.
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {page === "landing" && <LandingPage projects={projects} />}
        {page === "upload" && <UploadPage onDatasetSynced={handleDatasetSynced} />}
        {page === "admin" && <AdminDashboard projects={projects} />}
      </main>

      <footer className="border-t border-slate-200 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Smart India Hackathon — PRAGATI Prototype (SIH26103) · Ministry of Statistics and Programme Implementation</p>
          <p className="font-mono">Hackathon Prototype · Not an official Government of India platform</p>
        </div>
      </footer>
    </div>
  );
}
