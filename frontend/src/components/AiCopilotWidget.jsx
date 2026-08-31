import React, { useState, useEffect, useRef } from "react";

// Short, rotating status lines so the bot visibly communicates what it's
// "doing" in the background, instead of sitting there as a static icon.
const STATUS_MESSAGES = [
  "Tracking project budgets…",
  "Watching for delay risk…",
  "Syncing latest milestones…",
  "Scanning sector data…",
];

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
  const [statusIndex, setStatusIndex] = useState(0);
  const [showStatus, setShowStatus] = useState(false);

  const idleTimer = useRef(null);

  // Cycle a small "what I'm doing" bubble above the bot every few seconds,
  // pausing while the chat panel itself is open.
  useEffect(() => {
    if (isOpen) {
      setShowStatus(false);
      return;
    }
    let visibleTimeout;
    const cycle = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
      setShowStatus(true);
      visibleTimeout = setTimeout(() => setShowStatus(false), 2600);
    }, 4200);
    setShowStatus(true);
    visibleTimeout = setTimeout(() => setShowStatus(false), 2600);
    return () => {
      clearInterval(cycle);
      clearTimeout(visibleTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate cursor offsets from screen center (-1 to 1)
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      setPupilPos({ x: nx * 3, y: ny * 3 });
      setHeadTilt({ x: nx * 4, y: ny * 4 });

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setPupilPos({ x: 0, y: 0 });
        setHeadTilt({ x: 0, y: 0 });
      }, 700);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Natural Blinking Cycle
  useEffect(() => {
    let timeoutId, blinkTimeoutId;
    const scheduleBlink = () => {
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeoutId = setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, 3000 + Math.random() * 3000);
    };
    scheduleBlink();

    const handleClick = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkTimeoutId);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000]">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="absolute bottom-[75px] right-0 w-[330px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">PRAGATI AI Copilot</p>
              <p className="text-[10px] text-slate-400">Infrastructure Intelligence Engine</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold">
              ×
            </button>
          </div>

          <div className="p-4 bg-slate-50 max-h-[380px] overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed mb-3 space-y-2">
              <p>👋 Hi! I'm the PRAGATI AI Copilot.</p>
              <p>
                <strong>PRAGATI</strong> (Pro-Active Governance and Timely Implementation) tracks big government
                infrastructure projects — like highways, railways, and power plants — across India.
              </p>
              <p>This chatbot is a preview build for evaluation — full AI features are coming in the next version.</p>
            </div>

            {!showRoadmap ? (
              <button
                onClick={() => setShowRoadmap(true)}
                className="w-full text-left bg-amber-100 hover:bg-amber-200/70 border border-amber-500/30 text-amber-700 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                ⚡ Want to know what's coming in v2.0?
              </button>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="font-bold text-slate-900 mb-1">Planned for v2.0:</p>
                <ul className="space-y-1.5">
                  <li>🗺️ <strong>Geospatial map</strong> — tap on your state or city to explore project data visually</li>
                  <li>🤖 <strong>A user-friendly AI chatbot</strong> — to help guide users through the platform</li>
                  <li>📊 <strong>Full AI-powered project analysis</strong></li>
                  <li>🌫️ <strong>Pollution & environmental impact analysis</strong></li>
                  <li>📅 <strong>Upcoming projects overview</strong> — track timelines and details of future developments</li>
                  <li>✨ ...and more coming soon</li>
                </ul>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-200">
            <input
              type="text"
              placeholder="AI Copilot offline during evaluation..."
              disabled
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* "What I'm doing" status bubble */}
      {!isOpen && (
        <div
          className={`absolute bottom-[72px] right-1 max-w-[190px] bg-navy-900 text-white text-[11px] font-medium px-3 py-2 rounded-lg rounded-br-sm shadow-lg transition-all duration-300 ${
            showStatus ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
          }`}
        >
          {STATUS_MESSAGES[statusIndex]}
        </div>
      )}

      {/* SIMPLE HAPPY BOT BUTTON */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        aria-label="PRAGATI AI Copilot"
        className="relative h-16 w-16 rounded-full bg-navy-900 shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center justify-center p-0 mascot-idle"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            transform: `translate(${headTilt.x * 0.4}px, ${headTilt.y * 0.4}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Antenna */}
          <line x1="50" y1="12" x2="50" y2="22" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="10" r="4.5" fill="#D97706" />

          {/* Flat, friendly rounded head */}
          <rect x="20" y="22" width="60" height="52" rx="18" fill="#F5C99B" stroke="#0A192F" strokeWidth="2" />

          {/* Simple round eyes */}
          {!isBlinking ? (
            <g>
              <circle cx="39" cy="44" r="6.5" fill="#0A192F" />
              <circle cx={39 + pupilPos.x * 0.4} cy={44 + pupilPos.y * 0.4} r="2" fill="#ffffff" />
              <circle cx="61" cy="44" r="6.5" fill="#0A192F" />
              <circle cx={61 + pupilPos.x * 0.4} cy={44 + pupilPos.y * 0.4} r="2" fill="#ffffff" />
            </g>
          ) : (
            <g stroke="#0A192F" strokeWidth="3" strokeLinecap="round">
              <line x1="33" y1="44" x2="45" y2="44" />
              <line x1="55" y1="44" x2="67" y2="44" />
            </g>
          )}

          {/* Simple happy smile */}
          <path d="M37 58 Q50 70 63 58" stroke="#0A192F" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Rosy cheeks */}
          <circle cx="30" cy="56" r="3.5" fill="#D97706" opacity="0.35" />
          <circle cx="70" cy="56" r="3.5" fill="#D97706" opacity="0.35" />
        </svg>

        {/* Small pulsing "active" dot so it reads as live/working, not static */}
        <span className="absolute top-1 right-1.5 h-2.5 w-2.5 rounded-full bg-green-400 border border-navy-900 animate-pulse" />
      </button>
    </div>
  );
}