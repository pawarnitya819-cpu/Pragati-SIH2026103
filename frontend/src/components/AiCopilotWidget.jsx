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

      {/* HAPPY BOT CIRCLE BUTTON (VECTOR CONVERTED TO MATCH YOUR IMAGE) */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        aria-label="PRAGATI AI Copilot"
        className="relative h-16 w-16 rounded-full bg-[#071a33] shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 overflow-hidden border-2 border-slate-700 flex items-center justify-center p-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            transform: `translate(${headTilt.x * 0.4}px, ${headTilt.y * 0.4}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <defs>
            {/* Cyan to Lime Gradient Body */}
            <linearGradient id="cyanLimeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="60%" stopColor="#00e676" />
              <stop offset="100%" stopColor="#a3ff12" />
            </linearGradient>

            {/* Dark Visor Interior */}
            <linearGradient id="darkVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#080e18" />
              <stop offset="100%" stopColor="#020408" />
            </linearGradient>

            {/* Eye Gradient */}
            <radialGradient id="pupilGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e0f7fa" />
              <stop offset="100%" stopColor="#b2ebf2" />
            </radialGradient>
          </defs>

          {/* Antenna Pole & Bulb */}
          <rect x="48" y="10" width="4" height="12" rx="2" fill="url(#cyanLimeGradient)" />
          <circle cx="50" cy="8" r="4.5" fill="url(#cyanLimeGradient)" />

          {/* Head Base Joint */}
          <rect x="42" y="20" width="16" height="5" rx="2.5" fill="url(#cyanLimeGradient)" />

          {/* Main Curved Head Shell */}
          <path
            d="M 20 54 C 20 28, 80 28, 80 54 C 80 76, 20 76, 20 54 Z"
            fill="url(#cyanLimeGradient)"
          />

          {/* Glossy Head Reflection / Highlight */}
          <ellipse cx="68" cy="38" rx="6" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-20 68 38)" />

          {/* Dark Glass Visor */}
          <rect x="28" y="42" width="44" height="26" rx="13" fill="url(#darkVisor)" />

          {/* Dynamic Pupil Interactive Eyes & Blinking Logic */}
          {!isBlinking ? (
            <g>
              {/* Left Eye */}
              <circle cx="41" cy="55" r="7" fill="url(#pupilGlow)" />
              <circle cx={41 + pupilPos.x} cy={55 + pupilPos.y} r="4.5" fill="#031325" />
              {/* Sparkle Highlights */}
              <circle cx={43 + pupilPos.x} cy={53 + pupilPos.y} r="1.5" fill="#ffffff" />
              <circle cx={39 + pupilPos.x} cy={57 + pupilPos.y} r="0.8" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="59" cy="55" r="7" fill="url(#pupilGlow)" />
              <circle cx={59 + pupilPos.x} cy={55 + pupilPos.y} r="4.5" fill="#031325" />
              {/* Sparkle Highlights */}
              <circle cx={61 + pupilPos.x} cy={53 + pupilPos.y} r="1.5" fill="#ffffff" />
              <circle cx={57 + pupilPos.x} cy={57 + pupilPos.y} r="0.8" fill="#ffffff" />
            </g>
          ) : (
            /* Curved Blinking Arcs */
            <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 36 55 Q 41 50 46 55" />
              <path d="M 54 55 Q 59 50 64 55" />
            </g>
          )}

          {/* White Happy Smile */}
          <path d="M 43 73 Q 50 80 57 73 Z" fill="#ffffff" />
        </svg>
      </button>
    </div>
  );
}