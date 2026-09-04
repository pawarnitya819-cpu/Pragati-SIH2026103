import { useEffect, useState } from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import AdminDashboard from "./components/AdminDashboard";
import CursorFollower from "./components/CursorFollower";
import AiCopilotWidget from "./components/AiCopilotWidget";
import { SEED_PROJECTS } from "./data/sampleProjects";
import { scoreProjects, dedupeProjects } from "./utils/riskEngine";
import { fetchProjects } from "./api";
import { WifiOff } from "lucide-react";
import { abstractLinePattern } from "./utils/backgroundPattern";

export default function App() {
  const [page, setPage] = useState("landing");
  const [projects, setProjects] = useState(() => scoreProjects(dedupeProjects(SEED_PROJECTS)));
  const [backendOnline, setBackendOnline] = useState(true);
  const [backendWaking, setBackendWaking] = useState(false);

  // Site photos / inspection media live at the same level as the project
  // register rather than inside UploadPage, so attachments survive a tab
  // switch and can be read by any view that needs evidence alongside a
  // project's sector and budget figures.
  const [siteMedia, setSiteMedia] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Render's free tier spins the backend down after ~15 min idle; the
    // first request after that can take 30-60s to wake it. A single failed
    // fetch used to permanently flip the "offline" banner even when the
    // backend was just slow to start — retry with backoff instead of
    // giving up after one attempt.
    const attemptFetch = async (retriesLeft, delayMs) => {
      try {
        const data = await fetchProjects();
        if (cancelled) return;
        setProjects(scoreProjects(dedupeProjects(data)));
        setBackendOnline(true);
        setBackendWaking(false);
      } catch (err) {
        if (cancelled) return;
        if (retriesLeft > 0) {
          setBackendWaking(true);
          await sleep(delayMs);
          if (!cancelled) attemptFetch(retriesLeft - 1, Math.min(delayMs * 1.5, 10000));
        } else {
          setBackendOnline(false);
          setBackendWaking(false);
        }
      }
    };

    attemptFetch(5, 4000); // up to ~5 tries, growing delay, ~35s total ceiling

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDatasetSynced = (updater) => {
    setProjects((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return scoreProjects(dedupeProjects(next));
    });
  };

  return (
    <div
      className="min-h-screen bg-paper relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(abstractLinePattern)}")`,
        backgroundSize: "400px 400px",
        backgroundAttachment: "fixed",
      }}
    >
      <CursorFollower />
      <AiCopilotWidget />
      <Header page={page} setPage={setPage} />

      {backendWaking && (
        <div className="bg-navy-900/5 border-b border-navy-700/20 text-navy-700 text-xs font-medium px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          Waking up the backend server — this can take up to a minute on first load…
        </div>
      )}

      {!backendOnline && !backendWaking && (
        <div className="bg-saffron-100 border-b border-saffron-600/30 text-saffron-600 text-xs font-medium px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          Backend is waking up or unreachable — running on pre-loaded sample data
          only. Uploads will use a client-side fallback parser.
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {page === "landing" && <LandingPage projects={projects} />}
        {page === "upload" && (
          <UploadPage
            onDatasetSynced={handleDatasetSynced}
            siteMedia={siteMedia}
            onSiteMediaChange={setSiteMedia}
          />
        )}
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