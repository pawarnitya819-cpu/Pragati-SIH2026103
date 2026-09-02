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

export default function App() {
  const [page, setPage] = useState("landing");
  const [projects, setProjects] = useState(() => scoreProjects(dedupeProjects(SEED_PROJECTS)));
  const [backendOnline, setBackendOnline] = useState(true);

  // Site photos / inspection media live at the same level as the project
  // register rather than inside UploadPage, so attachments survive a tab
  // switch and can be read by any view that needs evidence alongside a
  // project's sector and budget figures.
  const [siteMedia, setSiteMedia] = useState([]);

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(scoreProjects(dedupeProjects(data)));
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const handleDatasetSynced = (updater) => {
    setProjects((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return scoreProjects(dedupeProjects(next));
    });
  };

  return (
       <div className="min-h-screen bg-paper relative">
      <CursorFollower />
      <AiCopilotWidget />
      <Header page={page} setPage={setPage} />

            {!backendOnline && (
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