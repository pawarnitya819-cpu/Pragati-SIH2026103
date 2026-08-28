import { useEffect, useRef, useState } from "react";

const EYE_MOVE_RADIUS = 2.5;

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const faceRef = useRef(null);
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const pupilOffset = (eyeX, eyeY, mouseX, mouseY) => {
      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(EYE_MOVE_RADIUS, Math.hypot(dx, dy) / 20);
      return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };

    const handleMove = (e) => {
      const el = faceRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const leftEye = { x: rect.left + rect.width * 0.36, y: rect.top + rect.height * 0.42 };
      const rightEye = { x: rect.left + rect.width * 0.64, y: rect.top + rect.height * 0.42 };

      setLeftPupil(pupilOffset(leftEye.x, leftEye.y, e.clientX, e.clientY));
      setRightPupil(pupilOffset(rightEye.x, rightEye.y, e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Occasional blink — fires on a randomized interval (roughly every 3-6s)
  // so it reads as a natural, subtle "alive" cue rather than a looping tic.
  useEffect(() => {
    let timeoutId;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Also blink whenever the user clicks anywhere on the page — a little
  // reaction cue tied to real interaction, not just the idle timer.
  useEffect(() => {
    const handleClick = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <button
        ref={faceRef}
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        className="h-14 w-14 rounded-full bg-navy-900 text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" width="40" height="40" aria-hidden="true">
          {/* antenna */}
          <line x1="50" y1="10" x2="50" y2="20" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="8" r="5" fill="#F59E0B" />

          {/* head */}
          <rect x="18" y="20" width="64" height="56" rx="16" fill="#E2E8F0" stroke="#0A192F" strokeWidth="2" />

          {/* eyes — closed lids while blinking, open + pupil tracking otherwise */}
          {isBlinking ? (
            <>
              <line x1="27" y1="42" x2="45" y2="42" stroke="#0A192F" strokeWidth="3" strokeLinecap="round" />
              <line x1="55" y1="42" x2="73" y2="42" stroke="#0A192F" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="36" cy="42" r="11" fill="white" stroke="#0A192F" strokeWidth="2" />
              <circle cx="64" cy="42" r="11" fill="white" stroke="#0A192F" strokeWidth="2" />
              <circle cx={36 + leftPupil.x * 4} cy={42 + leftPupil.y * 4} r="5" fill="#0A192F" />
              <circle cx={64 + rightPupil.x * 4} cy={42 + rightPupil.y * 4} r="5" fill="#0A192F" />
            </>
          )}

          {/* cheeks — soft blush for a friendlier look */}
          <circle cx="27" cy="54" r="5" fill="#F59E0B" opacity="0.25" />
          <circle cx="73" cy="54" r="5" fill="#F59E0B" opacity="0.25" />

          {/* mouth — happy smile */}
          <path d="M34 58 Q50 74 66 58" stroke="#0A192F" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-[75px] right-0 w-[330px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-navy-900 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">PRAGATI AI Copilot</p>
              <p className="text-[10px] text-slate-400">Infrastructure Intelligence Engine</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold">
              ×
            </button>
          </div>

          <div className="p-4 bg-slate-50 max-h-[380px] overflow-y-auto">
            <span className="inline-block bg-saffron-100 text-saffron-600 text-[11px] font-bold px-2 py-1 rounded-full mb-3">
              ⚡ Planned v2.0 Roadmap
            </span>

            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed mb-3">
              <strong className="text-navy-900">Automated Monitoring Assistant</strong>
              <br />
              A planned RAG-driven model to analyze project delays, auto-generate risk
              assessment reports, and query real-time GIS and infrastructure progress logs.
            </div>

            <div className="bg-blue-50 border-l-4 border-navy-700 rounded p-2.5 text-[11px] text-navy-700">
              <strong>Technical Specifications:</strong>
              <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                <li><strong>Core Engine:</strong> Fine-tuned RAG pipeline</li>
                <li><strong>Data Pipeline:</strong> Vector search over project GIS & delay logs</li>
                <li><strong>Capabilities:</strong> Anomaly detection & multi-agency sync alerts</li>
              </ul>
            </div>
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
    </div>
  );
}