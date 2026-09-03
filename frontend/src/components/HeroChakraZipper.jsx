import { useEffect, useRef, useState } from "react";

// Combines the Ashoka Chakra badge and the hero title's "zipper reveal"
// into one synced piece, per spec: the chakra itself bounces onto the seam
// of the zip, drags across left-to-right OPENING the zip as it goes (it is
// the only thing that opens it — there is no separate pull-tab object),
// then hops up into its resting "porthole" slot and spins there forever.
//
// Positions are measured at runtime (getBoundingClientRect) and fed into
// the CSS animation as custom properties, so the journey lines up
// correctly regardless of screen size.

const DROP_MS = 1400;   // bounce down onto the seam (slower, per request)
const DRAG_MS = 2600;   // travel across, opening the zip as it goes
const SETTLE_MS = 1100; // hop up into the resting porthole slot
const TOTAL_MS = DROP_MS + DRAG_MS + SETTLE_MS;

export default function HeroChakraZipper({ children }) {
  const chakraRef = useRef(null);
  const titleRef = useRef(null);
  const [vars, setVars] = useState(null);

  useEffect(() => {
    function measure() {
      const chakraEl = chakraRef.current;
      const titleEl = titleRef.current;
      if (!chakraEl || !titleEl) return;

      const chakraRect = chakraEl.getBoundingClientRect();
      const titleRect = titleEl.getBoundingClientRect();

      const chakraCenterX = chakraRect.left + chakraRect.width / 2;
      const chakraCenterY = chakraRect.top + chakraRect.height / 2;
      const seamY = titleRect.top + titleRect.height / 2;
      const seamStartX = titleRect.left + chakraRect.width / 2;
      const seamEndX = titleRect.right - chakraRect.width / 2;

      setVars({
        "--p1x": `${seamStartX - chakraCenterX}px`,
        "--p1y": `${seamY - chakraCenterY}px`,
        "--p2x": `${seamEndX - chakraCenterX}px`,
        "--p2y": `${seamY - chakraCenterY}px`,
      });
    }

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Flap + teeth animation: delayed until the chakra lands on the seam,
  // and its duration matches the chakra's drag phase exactly — so the
  // reveal happens precisely while (and only while) the chakra is
  // dragging across, with nothing else driving it.
  const zipStyle = {
    animationDelay: `${DROP_MS}ms`,
    animationDuration: `${DRAG_MS}ms`,
    animationTimingFunction: "cubic-bezier(.65,0,.35,1)",
    animationFillMode: "both",
  };

  return (
    <>
      {/* Ashoka Chakra — rendered at its final resting "porthole" slot;
          the journey animation displaces it from there and back. */}
      <div
        ref={chakraRef}
        className="hidden md:block absolute top-1/2 right-6 sm:right-8 -translate-y-1/2 h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 z-40"
      >
        <div
          className="h-full w-full rounded-full animate-chakra-journey"
          style={{
            boxShadow:
              "inset 0 6px 18px rgba(0,0,0,0.45), inset 0 -3px 10px rgba(255,255,255,0.08), 0 0 0 6px rgba(0,0,0,0.2), 0 2px 10px rgba(0,0,0,0.3)",
            animationDuration: `${TOTAL_MS}ms`,
            animationTimingFunction: "cubic-bezier(.4,0,.2,1)",
            animationFillMode: "both",
            ...vars,
          }}
        >
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className="h-full w-full animate-[spin_30s_linear_infinite]"
            style={{ animationDelay: "0ms", willChange: "transform" }}
          >
            <defs>
              <radialGradient id="chakraDisc" cx="42%" cy="38%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#f1f3f6" />
                <stop offset="100%" stopColor="#c9d0d9" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="98" fill="url(#chakraDisc)" />
            <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(11,31,58,0.15)" strokeWidth="2" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="#0B1F3A" strokeWidth="3.5" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="18"
                  stroke="#0B1F3A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 100 100)`}
                />
              );
            })}
            <circle cx="100" cy="100" r="14" fill="#0B1F3A" />
            <circle cx="100" cy="100" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Title block — hidden behind fabric flaps until the chakra drags
          the zip open across the seam. No other object opens it. */}
      <div ref={titleRef} className="relative overflow-hidden">
        {children}

        <div className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-x-0 top-0 h-1/2 bg-navy-900 animate-zip-flap"
            style={{
              ...zipStyle,
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 3px, transparent 3px 7px)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-navy-900 animate-zip-flap"
            style={{
              ...zipStyle,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 3px, transparent 3px 7px)",
            }}
          />
        </div>

        <svg
          viewBox="0 0 400 16"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-4 z-30 pointer-events-none animate-zip-flap"
          style={zipStyle}
        >
          {Array.from({ length: 50 }).map((_, i) => {
            const x = i * 8 + 4;
            const up = i % 2 === 0;
            return (
              <polygon
                key={i}
                points={
                  up
                    ? `${x - 3},8 ${x + 3},8 ${x},1`
                    : `${x - 3},8 ${x + 3},8 ${x},15`
                }
                fill="#c9d0d9"
                stroke="#0B1F3A"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      </div>
    </>
  );
}