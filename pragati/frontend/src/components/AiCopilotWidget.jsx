import { useEffect, useRef, useState } from "react";

const EYE_MOVE_RADIUS = 2.5;
const CURSOR_IDLE_MS = 650;

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const faceRef = useRef(null);
  const idleTimer = useRef(null);

  // Eye tracking logic
  useEffect(() => {
    const pupilOffset = (eyeX, eyeY, mouseX, mouseY) => {
      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(EYE_MOVE_RADIUS, Math.hypot(dx, dy) / 20);
      return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };

    const handleMove = (e) => {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();

      setLeftPupil(pupilOffset(rect.left + rect.width * 0.36, rect.top + rect.height * 0.42, e.clientX, e.clientY));
      setRightPupil(pupilOffset(rect.left + rect.width * 0.64, rect.top + rect.height * 0.42, e.clientX, e.clientY));

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setLeftPupil({ x: 0, y: 0 });
        setRightPupil({ x: 0, y: 0 });
      }, CURSOR_IDLE_MS);
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Natural & click blinking logic
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
          <div className="bg-navy-900 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">PRAGATI AI Copilot</p>
              <p className="text-[10px] text-slate-400">Infrastructure Intelligence Engine</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold">×</button>
          </div>

          <div className="p-4 bg-slate-50 max-h-[380px] overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed mb-3 space-y-2">
              <p>👋 Hi! I'm the PRAGATI AI Copilot.</p>
              <p>
                <strong>PRAGATI</strong> (Pro-Active Governance and Timely Implementation) tracks big government
                infrastructure projects — like highways, railways, and power plants — across India, showing spending, real progress, and delay risks.
              </p>
              <p>This chatbot is a preview build for evaluation — full AI features are coming in the next version.</p>
            </div>

            {!showRoadmap ? (
              <button
                onClick={() => setShowRoadmap(true)}
                className="w-full text-left bg-saffron-100 hover:bg-saffron-100/70 border border-saffron-600/30 text-saffron-600 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                ⚡ Want to know what's coming in v2.0?
              </button>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="font-bold text-navy-900 mb-1">Planned for v2.0:</p>
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

      {/* 3D BOT BUTTON */}
      <button
        ref={faceRef}
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        aria-label="PRAGATI AI Copilot"
        className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center bg-[#071A33] shadow-[0_8px_20px_rgba(7,26,51,0.30)] hover:scale-105 active:scale-95 transition-transform duration-200 group"
      >
        {/* OUTER 3D ORB */}
        <div className="absolute inset-0 rounded-full overflow-hidden bg-[#071A33] shadow-[inset_4px_4px_10px_rgba(255,255,255,0.12),inset_-5px_-7px_12px_rgba(0,0,0,0.45)]">
          <div className="absolute left-[7px] top-[5px] w-[25px] h-[13px] rounded-full bg-white/10 blur-[3px] rotate-[-25deg]" />
          <div className="absolute right-[5px] bottom-[5px] w-[17px] h-[17px] rounded-full bg-blue-400/10 blur-[5px]" />
        </div>

        {/* 3D ROBOT FACE */}
        <svg viewBox="0 0 100 100" width="42" height="42" aria-hidden="true" className="relative z-10 overflow-visible">
          {/* ANTENNA */}
          <line x1="50" y1="10" x2="50" y2="20" stroke="#B8C4D2" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="8" r="6" fill="#F59E0B" opacity="0.18" />
          <circle cx="50" cy="8" r="4" fill="#F59E0B" />
          <circle cx="48.5" cy="6.5" r="1.3" fill="#FFE9AE" />

          {/* FACE SHADOW */}
          <rect x="18" y="22" width="64" height="56" rx="17" fill="#020B18" opacity="0.45" transform="translate(2 3)" />

          {/* MAIN FACE */}
          <defs>
            <linearGradient id="botFaceGradient" x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            <linearGradient id="glassesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E8EDF3" />
            </linearGradient>

            <filter id="faceShadow" x="-30%" y="-30%" width="160%" height="170%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#06172B" floodOpacity="0.35" />
            </filter>
          </defs>

          <rect x="18" y="20" width="64" height="56" rx="17" fill="url(#botFaceGradient)" stroke="#0A192F" strokeWidth="2" filter="url(#faceShadow)" />
          <path d="M27 29 Q34 23 46 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.85" />

          {/* EYES */}
          {isBlinking ? (
            <>
              <path d="M28 42 Q36 46 44 42" fill="none" stroke="#0A192F" strokeWidth="3" strokeLinecap="round" />
              <path d="M56 42 Q64 46 72 42" fill="none" stroke="#0A192F" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="36" cy="42" r="11" fill="url(#glassesGradient)" stroke="#0A192F" strokeWidth="2" />
              <circle cx="64" cy="42" r="11" fill="url(#glassesGradient)" stroke="#0A192F" strokeWidth="2" />
              <circle cx={36 + leftPupil.x * 4} cy={42 + leftPupil.y * 4} r="5" fill="#071A33" style={{ transition: "cx 0.18s cubic-bezier(.2,.8,.2,1), cy 0.18s cubic-bezier(.2,.8,.2,1)" }} />
              <circle cx={64 + rightPupil.x * 4} cy={42 + rightPupil.y * 4} r="5" fill="#071A33" style={{ transition: "cx 0.18s cubic-bezier(.2,.8,.2,1), cy 0.18s cubic-bezier(.2,.8,.2,1)" }} />
              <circle cx={34.5 + leftPupil.x * 4} cy={40.5 + leftPupil.y * 4} r="1.5" fill="white" opacity="0.9" />
              <circle cx={62.5 + rightPupil.x * 4} cy={40.5 + rightPupil.y * 4} r="1.5" fill="white" opacity="0.9" />
            </>
          )}

          {/* CHEEKS */}
          <circle cx="27" cy="55" r="5" fill="#F59E0B" opacity="0.18" />
          <circle cx="73" cy="55" r="5" fill="#F59E0B" opacity="0.18" />

          {/* SMILE */}
          <path d="M34 58 Q50 73 66 58" stroke="#0A192F" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}