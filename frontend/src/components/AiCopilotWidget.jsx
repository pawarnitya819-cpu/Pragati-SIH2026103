import React, { useState, useEffect, useRef } from "react";

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });

  const idleTimer = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
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

      <button
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        aria-label="PRAGATI AI Copilot"
        className="relative h-16 w-16 rounded-full bg-transparent shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 overflow-visible flex items-center justify-center p-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            transform: `translate(${headTilt.x * 0.4}px, ${headTilt.y * 0.4}px)`,
            transition: "transform 0.1s ease-out",
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="headShade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>

            <linearGradient id="visorShade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F2027" />
              <stop offset="100%" stopColor="#16302F" />
            </linearGradient>

            <radialGradient id="glowTip" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#134E4A" />
            </radialGradient>
          </defs>

          <ellipse cx="12" cy="62" rx="8" ry="12" fill="url(#headShade)" transform="rotate(-25 12 62)" />

          <rect x="47.5" y="6" width="5" height="14" rx="2" fill="#0F766E" />
          <circle cx="50" cy="6" r="5.5" fill="url(#glowTip)" />

          <circle cx="50" cy="50" r="40" fill="url(#headShade)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.25))" />

          <rect x="24" y="34" width="52" height="34" rx="16" fill="url(#visorShade)" />

          {!isBlinking ? (
            <g>
              <circle cx="38" cy="50" r="8.5" fill="#ffffff" />
              <circle cx={38 + pupilPos.x} cy={50 + pupilPos.y} r="4" fill="#0F2027" />

              <circle cx="62" cy="50" r="8.5" fill="#ffffff" />
              <circle cx={62 + pupilPos.x} cy={50 + pupilPos.y} r="4" fill="#0F2027" />
            </g>
          ) : (
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 31 50 Q 38 45 45 50" />
              <path d="M 55 50 Q 62 45 69 50" />
            </g>
          )}
        </svg>
      </button>
    </div>
  );
}