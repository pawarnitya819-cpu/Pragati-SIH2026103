import { X, MapPin } from "lucide-react";
import { getStatePosition } from "../data/stateCoordinates";

export default function ProjectLocationMap({ project, onClose }) {
  if (!project) return null;

  const { x, y } = getStatePosition(project.state);

  return (
    <div
      className="fixed inset-0 z-[1100] bg-navy-900/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-navy-900 text-white px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold">{project.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{project.ministry}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative w-full aspect-[4/5] bg-blue-50 rounded-xl overflow-hidden ring-1 ring-slate-200">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              {/* Stylized, illustrative outline of India — not to scale */}
              <path
                d="M 40 2 C 46 0, 50 3, 48 8 C 55 6, 60 10, 58 16
                   C 68 12, 78 10, 84 16 C 90 20, 88 28, 82 30
                   C 86 34, 82 38, 76 34 C 70 38, 66 34, 62 30
                   C 66 36, 68 42, 62 46 C 66 52, 64 60, 58 62
                   C 60 68, 56 74, 50 76 C 52 82, 48 90, 42 94
                   C 38 98, 34 96, 33 90 C 30 84, 28 78, 24 74
                   C 18 70, 14 64, 16 58 C 10 54, 8 48, 12 44
                   C 8 40, 6 34, 10 30 C 6 26, 8 20, 14 18
                   C 12 12, 16 8, 22 10 C 24 6, 28 2, 34 4
                   C 36 2, 38 2, 40 2 Z"
                fill="#DBEAFE"
                stroke="#93C5FD"
                strokeWidth="0.6"
              />

              {/* Pulsing marker at the project's state */}
              <circle cx={x} cy={y} r="4.5" fill="#DC2626" opacity="0.25">
                <animate attributeName="r" values="4.5;8;4.5" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0;0.25" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="2.4" fill="#DC2626" stroke="white" strokeWidth="0.6" />
            </svg>
          </div>

          <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-navy-700 mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold text-navy-900">{project.state}</span> — approximate
              state-level location. Precise site coordinates aren't part of the uploaded dataset
              yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}