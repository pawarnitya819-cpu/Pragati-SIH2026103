import { useState } from "react";

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        className="h-14 w-14 rounded-full bg-navy-900 text-white text-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        🤖
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