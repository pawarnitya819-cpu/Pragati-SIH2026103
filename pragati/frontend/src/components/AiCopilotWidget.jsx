import { useEffect, useRef, useState } from "react";

const EYE_MOVE_RADIUS = 2.4;
const IDLE_RECENTER_MS = 600;

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const idleTimer = useRef(null);
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const pupilOffset = (eyeX, eyeY, mouseX, mouseY) => {
      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(EYE_MOVE_RADIUS, Math.hypot(dx, dy) / 20);
      return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };

    const recenter = () => {
      setLeftPupil({ x: 0, y: 0 });
      setRightPupil({ x: 0, y: 0 });
    };

    const handleMove = (e) => {
      const el = buttonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scaleX = rect.width / 48;
      const scaleY = rect.height / 48;
      const leftEye = { x: rect.left + 18 * scaleX, y: rect.top + 24 * scaleY };
      const rightEye = { x: rect.left + 30 * scaleX, y: rect.top + 24 * scaleY };

      setLeftPupil(pupilOffset(leftEye.x, leftEye.y, e.clientX, e.clientY));
      setRightPupil(pupilOffset(rightEye.x, rightEye.y, e.clientX, e.clientY));

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(recenter, IDLE_RECENTER_MS);
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000]">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-navy-900 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        <svg viewBox="0 0 48 48" width="70%" height="70%">
          <line x1="24" y1="6" x2="24" y2="12" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="5" r="2.5" fill="#D97706" />

          <rect x="8" y="12" width="32" height="26" rx="9" fill="#F1F5F9" />

          <circle cx="18" cy="24" r="6" fill="white" />
          <circle cx="30" cy="24" r="6" fill="white" />

          <circle
            cx={18 + leftPupil.x}
            cy={24 + leftPupil.y}
            r="3"
            fill="#0A192F"
            style={{ transition: "cx 0.35s ease-out, cy 0.35s ease-out" }}
          />
          <circle
            cx={30 + rightPupil.x}
            cy={24 + rightPupil.y}
            r="3"
            fill="#0A192F"
            style={{ transition: "cx 0.35s ease-out, cy 0.35s ease-out" }}
          />

          <rect x="18" y="32" width="12" height="3" rx="1.5" fill="#94A3B8" />
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