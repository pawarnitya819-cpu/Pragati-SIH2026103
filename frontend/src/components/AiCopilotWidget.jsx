import React, { useEffect, useRef, useState } from "react";

const Eye = ({ cx, isBlinking, pupilPos }) => (
  <g>
    <circle cx={cx} cy="52" r="8" fill="#ffffff" />
    {!isBlinking ? (
      <>
        <circle
          cx={cx + pupilPos.x}
          cy={52 + pupilPos.y}
          r="4.7"
          fill="#061525"
          className="transition-all duration-150 ease-out"
        />
        <circle
          cx={cx - 1.3 + pupilPos.x}
          cy={49.5 + pupilPos.y}
          r="1.6"
          fill="#ffffff"
          className="transition-all duration-150 ease-out"
        />
        <circle
          cx={cx + 2.4 + pupilPos.x}
          cy={54 + pupilPos.y}
          r="0.8"
          fill="#ffffff"
          className="transition-all duration-150 ease-out"
        />
      </>
    ) : (
      <path
        d={`M ${cx - 5} 52 Q ${cx} 47 ${cx + 5} 52`}
        stroke="#061525"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    )}
  </g>
);

const RoadmapItem = ({ icon, title, desc }) => (
  <div className="flex gap-2">
    <span className="text-sm">{icon}</span>
    <div>
      <p className="font-bold text-slate-800">{title}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });

  const idleTimer = useRef(null);
  const blinkTimer = useRef(null);
  const waveTimer = useRef(null);

  // Mouse Tracking & Idle Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      setPupilPos({ x: mouseX * 3.2, y: mouseY * 2.5 });
      setHeadTilt({ x: mouseX * 3, y: mouseY * 2 });
      setIsIdle(false);

      if (idleTimer.current) clearTimeout(idleTimer.current);

      idleTimer.current = setTimeout(() => {
        setPupilPos({ x: 0, y: 0 });
        setHeadTilt({ x: 0, y: 0 });
        setIsIdle(true);
      }, 900);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Blinking Cycle
  useEffect(() => {
    let mounted = true;
    const createBlink = () => {
      blinkTimer.current = setTimeout(() => {
        if (!mounted) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (!mounted) return;
          setIsBlinking(false);
          createBlink();
        }, 140);
      }, 2800 + Math.random() * 3500);
    };
    createBlink();
    return () => {
      mounted = false;
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, []);

  // Waving Cycle
  useEffect(() => {
    const createWave = () => {
      waveTimer.current = setTimeout(() => {
        setIsWaving(true);
        setTimeout(() => {
          setIsWaving(false);
          createWave();
        }, 1000);
      }, 7000 + Math.random() * 6000);
    };
    createWave();
    return () => {
      if (waveTimer.current) clearTimeout(waveTimer.current);
    };
  }, []);

  const handleBotClick = () => {
    setIsOpen((prev) => !prev);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 900);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000]">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="absolute bottom-[135px] right-0 w-[350px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200 overflow-hidden animate-[copilotAppear_0.25s_ease-out]">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <p className="text-sm font-bold">PRAGATI AI Copilot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] text-slate-400">Preview Mode</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Copilot"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition text-xl"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 max-h-[390px] overflow-y-auto">
            <div className="flex items-start gap-2 mb-3">
              <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-xs">
                🤖
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-3 text-xs text-slate-600 leading-relaxed shadow-sm">
                <p>👋 Hi! I'm the <strong className="text-slate-900">PRAGATI AI Copilot</strong>.</p>
                <p className="mt-2">PRAGATI tracks major government infrastructure projects across India, including highways, railways and power projects.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">ℹ️</span>
                <p className="font-bold text-slate-900">Evaluation Preview</p>
              </div>
              <p>This chatbot is currently running in preview mode. Full AI-powered features will be available in the next version.</p>
            </div>

            {!showRoadmap ? (
              <button
                onClick={() => setShowRoadmap(true)}
                className="w-full flex items-center gap-2 text-left bg-amber-100 hover:bg-amber-200 border border-amber-400/40 text-amber-700 text-xs font-bold px-3 py-3 rounded-xl transition-all hover:-translate-y-[1px]"
              >
                <span className="text-base">⚡</span>
                <span>Want to know what's coming in v2.0?</span>
              </button>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🚀</span>
                  <p className="font-bold text-slate-900">Planned for v2.0</p>
                </div>
                <div className="space-y-3">
                  <RoadmapItem icon="🗺️" title="Geospatial Map" desc="Explore infrastructure projects visually by state and city." />
                  <RoadmapItem icon="🤖" title="AI Chatbot" desc="Ask questions and navigate the platform naturally." />
                  <RoadmapItem icon="📊" title="AI Project Analysis" desc="Intelligent analysis of project progress and performance." />
                  <RoadmapItem icon="🌱" title="Environmental Analysis" desc="Pollution and environmental impact insights." />
                  <RoadmapItem icon="📅" title="Upcoming Projects" desc="Track future infrastructure developments and timelines." />
                </div>
                <button
                  onClick={() => setShowRoadmap(false)}
                  className="mt-4 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative">
              <input
                type="text"
                disabled
                placeholder="AI Copilot offline during evaluation..."
                className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-[11px] text-slate-500 outline-none cursor-not-allowed"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MASCOT BUTTON */}
      <button
        onClick={handleBotClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="PRAGATI AI Copilot"
        aria-label="Open PRAGATI AI Copilot"
        className="group relative w-[115px] h-[130px] sm:w-[135px] sm:h-[150px] bg-transparent border-0 p-0 cursor-pointer outline-none"
      >
        <div className="absolute left-1/2 bottom-1 -translate-x-1/2 w-[80px] h-[25px] rounded-full bg-cyan-400/20 blur-xl transition-all duration-500 group-hover:bg-cyan-400/35 group-hover:w-[100px]" />

        <div
          className={`absolute inset-0 transition-transform duration-200 ease-out ${isIdle ? "animate-[botFloat_3s_ease-in-out_infinite]" : ""}`}
          style={{ transform: `translate(${headTilt.x * 0.35}px, ${headTilt.y * 0.35}px)` }}
        >
          <svg viewBox="0 0 140 155" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="botBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00cfff" />
                <stop offset="55%" stopColor="#00e6a8" />
                <stop offset="100%" stopColor="#9cff39" />
              </linearGradient>
              <linearGradient id="botHeadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d9ff" />
                <stop offset="60%" stopColor="#00e9a5" />
                <stop offset="100%" stopColor="#a5f542" />
              </linearGradient>
              <linearGradient id="visorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#061321" />
                <stop offset="100%" stopColor="#02070e" />
              </linearGradient>
              <filter id="botShadow">
                <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Antenna */}
            <g>
              <rect x="68" y="15" width="4" height="18" rx="2" fill="url(#botBodyGradient)" />
              <circle cx="70" cy="11" r="5" fill="url(#botBodyGradient)" />
              <circle cx="68.5" cy="9.5" r="1.4" fill="#ffffff" opacity="0.8" />
            </g>

            {/* Neck */}
            <rect x="58" y="28" width="24" height="8" rx="4" fill="url(#botBodyGradient)" />

            {/* Head */}
            <path d="M 70 27 C 101 27 118 45 118 70 C 118 94 100 108 70 108 C 40 108 22 94 22 70 C 22 45 39 27 70 27 Z" fill="url(#botHeadGradient)" filter="url(#botShadow)" />
            <ellipse cx="98" cy="43" rx="9" ry="4" fill="#ffffff" opacity="0.55" transform="rotate(25 98 43)" />
            <circle cx="105" cy="51" r="2.5" fill="#ffffff" opacity="0.75" />

            {/* Visor */}
            <rect x="30" y="48" width="80" height="42" rx="20" fill="url(#visorGradient)" />
            <path d="M 38 58 C 50 51 72 50 92 54" stroke="#ffffff" strokeWidth="1" opacity="0.08" fill="none" />

            {/* Eyes */}
            <Eye cx={51} isBlinking={isBlinking} pupilPos={pupilPos} />
            <Eye cx={89} isBlinking={isBlinking} pupilPos={pupilPos} />

            {/* Smile */}
            <path d="M 59 96 Q 70 102 81 96 Q 70 109 59 96 Z" fill="#ffffff" />

            {/* Left Arm */}
            <g>
              <path d="M 28 105 C 18 107 11 103 7 97 C 5 94 7 91 10 92 C 16 95 22 98 31 96 Z" fill="url(#botBodyGradient)" />
              <circle cx="9" cy="95" r="3" fill="#00cfa9" />
            </g>

            {/* Right Arm */}
            <g style={{ transformOrigin: "111px 104px", transform: isWaving ? "rotate(-18deg)" : "rotate(0deg)", transition: "transform 0.25s ease-out" }}>
              <path d="M 112 99 C 123 96 130 101 131 108 C 132 113 129 117 125 116 C 121 115 119 110 110 109 Z" fill="url(#botBodyGradient)" />
              <circle cx="128" cy="112" r="3" fill="#00cfa9" />
            </g>

            {/* Body */}
            <path d="M 43 108 C 51 105 89 105 97 108 L 104 145 C 93 151 47 151 36 145 Z" fill="url(#botBodyGradient)" />
            <path d="M 49 113 C 60 110 69 110 76 111" stroke="#ffffff" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
            <ellipse cx="70" cy="130" rx="16" ry="7" fill="#ffffff" opacity="0.08" />
          </svg>
        </div>

        {/* Speech Bubble */}
        <div
          className={`absolute -top-[28px] -left-[25px] sm:-left-[40px] px-3 py-1.5 rounded-full bg-white shadow-lg border border-slate-100 text-cyan-500 text-[12px] sm:text-sm font-extrabold tracking-tight whitespace-nowrap transition-all duration-300 pointer-events-none ${
            isHovered || !isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
          }`}
        >
          Hello! 👋
          <span className="absolute right-[18px] -bottom-[5px] w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100" />
        </div>

        {/* Online Indicator */}
        <span className="absolute right-[8px] bottom-[12px] w-4 h-4 rounded-full bg-emerald-400 border-[3px] border-white shadow-md z-30" />
      </button>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes botFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes copilotAppear {
          0% { opacity: 0; transform: translateY(12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
}