import { useEffect, useRef, useState } from "react";

const EYE_MOVE_RADIUS = 2.2;
const IDLE_RECENTER_MS = 700;

export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const buttonRef = useRef(null);
  const idleTimer = useRef(null);

  const [leftEye, setLeftEye] = useState({ x: 0, y: 0 });
  const [rightEye, setRightEye] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disable mouse tracking on touch devices
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    ) {
      return;
    }

    const eyeOffset = (eyeX, eyeY, mouseX, mouseY) => {
      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;

      const angle = Math.atan2(dy, dx);

      const distance = Math.min(
        EYE_MOVE_RADIUS,
        Math.hypot(dx, dy) / 28
      );

      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    };

    const recenter = () => {
      setLeftEye({ x: 0, y: 0 });
      setRightEye({ x: 0, y: 0 });
    };

    const handleMove = (e) => {
      const el = buttonRef.current;

      if (!el) return;

      const rect = el.getBoundingClientRect();

      // Face coordinates
      const left = {
        x: rect.left + rect.width * 0.40,
        y: rect.top + rect.height * 0.50,
      };

      const right = {
        x: rect.left + rect.width * 0.60,
        y: rect.top + rect.height * 0.50,
      };

      setLeftEye(
        eyeOffset(left.x, left.y, e.clientX, e.clientY)
      );

      setRightEye(
        eyeOffset(right.x, right.y, e.clientX, e.clientY)
      );

      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }

      idleTimer.current = setTimeout(
        recenter,
        IDLE_RECENTER_MS
      );
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);

      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
    };
  }, []);

  const eyeTransition = {
    transition: "cx 0.22s ease-out, cy 0.22s ease-out",
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[1000]">

      {/* =====================================================
          CHAT WINDOW
      ====================================================== */}

      {isOpen && (
        <div
          className="
            absolute
            bottom-[76px]
            right-0
            w-[350px]
            max-w-[calc(100vw-32px)]
            bg-white
            rounded-2xl
            shadow-[0_20px_60px_rgba(10,25,47,0.18)]
            border
            border-slate-200
            overflow-hidden
            animate-[fadeIn_.2s_ease-out]
          "
        >

          {/* Header */}
          <div className="bg-[#0A192F] px-4 py-3.5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                {/* Small bot icon */}
                <div
                  className="
                    h-9 w-9
                    rounded-full
                    bg-white
                    flex items-center justify-center
                    shadow-sm
                  "
                >
                  <svg
                    viewBox="0 0 48 48"
                    width="28"
                    height="28"
                  >
                    {/* Antenna */}
                    <line
                      x1="24"
                      y1="5"
                      x2="24"
                      y2="10"
                      stroke="#0A192F"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <circle
                      cx="24"
                      cy="4"
                      r="2"
                      fill="#F5A623"
                    />

                    {/* Face */}
                    <rect
                      x="8"
                      y="11"
                      width="32"
                      height="28"
                      rx="9"
                      fill="#F5F7FA"
                      stroke="#D8DEE8"
                      strokeWidth="1"
                    />

                    {/* Glasses */}
                    <rect
                      x="12"
                      y="20"
                      width="10"
                      height="8"
                      rx="3"
                      fill="white"
                      stroke="#0A192F"
                      strokeWidth="1.3"
                    />

                    <rect
                      x="26"
                      y="20"
                      width="10"
                      height="8"
                      rx="3"
                      fill="white"
                      stroke="#0A192F"
                      strokeWidth="1.3"
                    />

                    <line
                      x1="22"
                      y1="24"
                      x2="26"
                      y2="24"
                      stroke="#0A192F"
                      strokeWidth="1.3"
                    />

                    {/* Eyes */}
                    <circle
                      cx={17 + leftEye.x}
                      cy={24 + leftEye.y}
                      r="2.2"
                      fill="#0A192F"
                      style={eyeTransition}
                    />

                    <circle
                      cx={31 + rightEye.x}
                      cy={24 + rightEye.y}
                      r="2.2"
                      fill="#0A192F"
                      style={eyeTransition}
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    PRAGATI Copilot
                  </p>

                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Project Monitoring Assistant
                  </p>
                </div>

              </div>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Copilot"
                className="
                  h-7 w-7
                  rounded-full
                  flex items-center justify-center
                  text-slate-300
                  hover:text-white
                  hover:bg-white/10
                  transition
                "
              >
                <span className="text-xl leading-none">
                  ×
                </span>
              </button>

            </div>

          </div>


          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div className="bg-[#F7F9FC] p-4">

            {/* Status */}
            <div
              className="
                inline-flex
                items-center
                gap-1.5
                px-2.5
                py-1
                rounded-full
                bg-amber-50
                border
                border-amber-200
                text-amber-700
                text-[10px]
                font-semibold
                mb-3
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Preview Mode
            </div>


            {/* Intro card */}
            <div
              className="
                bg-white
                border
                border-slate-200
                rounded-xl
                p-3.5
                mb-3
              "
            >

              <p className="text-xs font-semibold text-[#0A192F] mb-1.5">
                Project Monitoring Assistant
              </p>

              <p className="text-[11px] leading-relaxed text-slate-600">
                PRAGATI Copilot is designed to help officials
                identify project delays, review monitoring data,
                and generate concise project insights.
              </p>

            </div>


            {/* Planned capabilities */}
            <div
              className="
                bg-[#EEF5FF]
                border
                border-blue-100
                rounded-xl
                p-3.5
              "
            >

              <p className="text-[11px] font-semibold text-[#0A192F] mb-2">
                Planned capabilities
              </p>

              <div className="space-y-2">

                <Capability
                  number="01"
                  text="Query project monitoring data"
                />

                <Capability
                  number="02"
                  text="Identify potential delays and anomalies"
                />

                <Capability
                  number="03"
                  text="Generate project risk summaries"
                />

              </div>

            </div>

          </div>


          {/* =====================================================
              INPUT
          ====================================================== */}

          <div className="p-3 bg-white border-t border-slate-200">

            <div
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
              "
            >

              <input
                type="text"
                disabled
                placeholder="Copilot available in future version"
                className="
                  flex-1
                  min-w-0
                  bg-transparent
                  outline-none
                  text-[11px]
                  text-slate-500
                  placeholder:text-slate-400
                  cursor-not-allowed
                "
              />

              <button
                disabled
                className="
                  h-7
                  w-7
                  rounded-md
                  bg-slate-200
                  flex
                  items-center
                  justify-center
                  cursor-not-allowed
                "
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          FLOATING BOT BUTTON
      ====================================================== */}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen((open) => !open)}
        title="Open PRAGATI Copilot"
        aria-label="Open PRAGATI Copilot"
        className="
          group
          relative
          h-14
          w-14
          sm:h-16
          sm:w-16
          rounded-full
          bg-[#0A192F]
          flex
          items-center
          justify-center
          shadow-[0_8px_25px_rgba(10,25,47,0.28)]
          hover:scale-105
          active:scale-95
          transition-all
          duration-200
        "
      >

        {/* Subtle outer ring */}
        <span
          className="
            absolute
            inset-[-4px]
            rounded-full
            border
            border-[#0A192F]/10
            pointer-events-none
          "
        />

        {/* Robot */}
        <svg
          viewBox="0 0 48 48"
          width="72%"
          height="72%"
          className="relative z-10"
        >

          {/* Antenna */}
          <line
            x1="24"
            y1="6"
            x2="24"
            y2="11"
            stroke="#F5F7FA"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <circle
            cx="24"
            cy="5"
            r="2.7"
            fill="#F5A623"
          />


          {/* Robot face */}
          <rect
            x="7"
            y="11"
            width="34"
            height="28"
            rx="10"
            fill="#F5F7FA"
          />


          {/* Left glasses */}
          <rect
            x="11"
            y="19"
            width="12"
            height="10"
            rx="4"
            fill="white"
            stroke="#0A192F"
            strokeWidth="1.3"
          />

          {/* Right glasses */}
          <rect
            x="25"
            y="19"
            width="12"
            height="10"
            rx="4"
            fill="white"
            stroke="#0A192F"
            strokeWidth="1.3"
          />

          {/* Bridge */}
          <line
            x1="23"
            y1="24"
            x2="25"
            y2="24"
            stroke="#0A192F"
            strokeWidth="1.3"
          />


          {/* Eyes */}
          <circle
            cx={17 + leftEye.x}
            cy={24 + leftEye.y}
            r="2.6"
            fill="#0A192F"
            style={eyeTransition}
          />

          <circle
            cx={31 + rightEye.x}
            cy={24 + rightEye.y}
            r="2.6"
            fill="#0A192F"
            style={eyeTransition}
          />


          {/* Small smile */}
          <path
            d="M19 33 Q24 36.5 29 33"
            stroke="#F5A623"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />

        </svg>


        {/* Hover label */}
        <span
          className="
            absolute
            right-[72px]
            top-1/2
            -translate-y-1/2
            whitespace-nowrap
            rounded-md
            bg-[#0A192F]
            px-2.5
            py-1.5
            text-[10px]
            font-medium
            text-white
            opacity-0
            translate-x-1
            group-hover:opacity-100
            group-hover:translate-x-0
            transition-all
            duration-200
            pointer-events-none
            shadow-lg
          "
        >
          Ask PRAGATI
        </span>

      </button>

    </div>
  );
}


/* ============================================================
   CAPABILITY ROW
============================================================ */

function Capability({ number, text }) {
  return (
    <div className="flex items-center gap-2.5">

      <span
        className="
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-md
          bg-white
          border
          border-blue-100
          text-[8px]
          font-bold
          text-[#0A192F]
        "
      >
        {number}
      </span>

      <span className="text-[10px] text-slate-600">
        {text}
      </span>

    </div>
  );
}