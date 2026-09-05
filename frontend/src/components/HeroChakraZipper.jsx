import { useEffect, useRef, useState } from "react";

// Combined Component:
// 1. Initial Load: The Ashoka Chakra drops down, zips across the text to reveal it,
//    hops up to its resting slot, and fires an initial intro flame burst.
// 2. Interactive Phase: Clicking the Chakra acts as a button that kicks off a scale-pulse,
//    spins faster, and re-triggers the flame burst dynamically on every click.

const DROP_MS = 1400;   // bounce down onto the seam
const DRAG_MS = 2600;   // travel across, opening the zip
const SETTLE_MS = 1100; // hop up into resting porthole slot
const TOTAL_MS = DROP_MS + DRAG_MS + SETTLE_MS;

export default function HeroChakraZipper({ children }) {
  const chakraRef = useRef(null);
  const titleRef = useRef(null);
  const [vars, setVars] = useState(null);

  // Interactive Flame Burst & Spin State
  const [burstId, setBurstId] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [hiddenByHeader, setHiddenByHeader] = useState(false);
  const timerRef = useRef(null);

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

    // Mark intro animation as finished after TOTAL_MS
    const introTimer = setTimeout(() => {
      setIntroFinished(true);
    }, TOTAL_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      clearTimeout(introTimer);
    };
  }, []);

  // The header is `sticky top-0` at 72px tall (68px nav + 4px tricolor
  // strip). Rather than let the sticky header slice through the wheel
  // mid-scroll (a jarring half-circle), fade the wheel out just before it
  // would reach that band, and back in once it's clear again.
  useEffect(() => {
    const el = chakraRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const HEADER_HEIGHT = 72; // 68px nav + 4px tricolor strip
    const observer = new IntersectionObserver(
      ([entry]) => setHiddenByHeader(!entry.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleClick() {
    setBurstId((id) => id + 1);
    setSpinning(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSpinning(false), 1400);
  }

  const zipStyle = {
    animationDelay: `${DROP_MS}ms`,
    animationDuration: `${DRAG_MS}ms`,
    animationTimingFunction: "cubic-bezier(.65,0,.35,1)",
    animationFillMode: "both",
  };

  return (
    <>
      <style>{`
        @keyframes flameBurst {
          0%   { opacity: 0; transform: translate(0, 4px) rotate(var(--rot, 0deg)) scale(0.5); }
          20%  { opacity: 1; transform: translate(0, -2px) rotate(var(--rot, 0deg)) scale(1); }
          55%  { opacity: 1; transform: translate(var(--dx, 0px), -8px) rotate(var(--rot, 0deg)) scale(1.08); }
          100% { opacity: 0; transform: translate(calc(var(--dx, 0px) * 1.8), -20px) rotate(var(--rot, 0deg)) scale(0.6); }
        }
        @keyframes chakraKick {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes chakraSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Ashoka Chakra Container */}
      <div
        ref={chakraRef}
        className="hidden md:block absolute top-6 right-6 sm:top-8 sm:right-8 h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 z-[35]"
        style={{
          opacity: introFinished && hiddenByHeader ? 0 : 1,
          transition: "opacity 250ms ease",
          pointerEvents: introFinished && hiddenByHeader ? "none" : "auto",
        }}
      >
        <div
          className="h-full w-full rounded-full animate-chakra-journey relative"
          style={{
            boxShadow:
              "inset 0 6px 18px rgba(0,0,0,0.45), inset 0 -3px 10px rgba(255,255,255,0.08), 0 0 0 6px rgba(0,0,0,0.2), 0 2px 10px rgba(0,0,0,0.3)",
            animationDuration: `${TOTAL_MS}ms`,
            animationTimingFunction: "cubic-bezier(.4,0,.2,1)",
            animationFillMode: "both",
            ...vars,
          }}
        >
          {/* Flame Burst: Initial Intro Burst */}
          {!introFinished && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {[
                { left: "32%", delay: 0 },
                { left: "50%", delay: 100 },
                { left: "68%", delay: 200 },
              ].map((flame, i) => (
                <svg
                  key={`intro-flame-${i}`}
                  viewBox="0 0 24 32"
                  className="absolute bottom-full w-5 h-7 sm:w-6 sm:h-8 lg:w-7 lg:h-9 mb-2 sm:mb-3"
                  style={{
                    left: flame.left,
                    transform: "translateX(-50%)",
                    opacity: 0,
                    animation: "flameBurst 1400ms ease-out forwards",
                    animationDelay: `${TOTAL_MS + flame.delay}ms`,
                  }}
                >
                  <defs>
                    <linearGradient id={`flameGradIntro-${i}`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#ff5a1f" />
                      <stop offset="55%" stopColor="#ff9d2e" />
                      <stop offset="100%" stopColor="#ffe27a" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2C9 8 4 11 4 18a8 8 0 0 0 16 0c0-4-2-6-3-9 0 3-1.5 4.5-3 4.5C11.5 13.5 13 8 12 2Z"
                    fill={`url(#flameGradIntro-${i})`}
                  />
                </svg>
              ))}
            </div>
          )}

          {/* Flame Burst: Interactive Clicks */}
          {burstId > 0 && (
            <div key={burstId} className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {[
                { left: "30%", delay: 0, rot: "-18deg", dx: "-10px" },
                { left: "50%", delay: 0, rot: "0deg", dx: "0px" },
                { left: "70%", delay: 0, rot: "18deg", dx: "10px" },
              ].map((flame, i) => (
                <div
                  key={`click-flame-${i}`}
                  className="absolute bottom-full w-5 h-7 sm:w-6 sm:h-8 lg:w-7 lg:h-9 mb-2 sm:mb-3"
                  style={{ left: flame.left, transform: "translateX(-50%)" }}
                >
                  <svg
                    viewBox="0 0 24 32"
                    className="w-full h-full"
                    style={{
                      opacity: 0,
                      transformOrigin: "50% 100%",
                      animation: "flameBurst 1400ms ease-out forwards",
                      animationDelay: `${flame.delay}ms`,
                      "--rot": flame.rot,
                      "--dx": flame.dx,
                    }}
                  >
                    <defs>
                      <linearGradient id={`flameGradClick${burstId}-${i}`} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#ff5a1f" />
                        <stop offset="55%" stopColor="#ff9d2e" />
                        <stop offset="100%" stopColor="#ffe27a" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 2C9 8 4 11 4 18a8 8 0 0 0 16 0c0-4-2-6-3-9 0 3-1.5 4.5-3 4.5C11.5 13.5 13 8 12 2Z"
                      fill={`url(#flameGradClick${burstId}-${i})`}
                    />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Chakra Button */}
          <button
            type="button"
            onClick={handleClick}
            aria-label="Ignite"
            className="h-full w-full rounded-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/60 active:scale-95 transition-transform"
            style={{
              animation: spinning ? "chakraKick 300ms ease-out" : "none",
            }}
          >
            <svg
              viewBox="0 0 200 200"
              aria-hidden="true"
              style={{
                willChange: "transform",
                animation: introFinished
                  ? "chakraSpin 12s linear infinite"
                  : `spin 10s linear ${(DRAG_MS / 10000).toFixed(4)} both, spin 30s linear infinite`,
                animationDelay: introFinished ? "0ms" : `${DROP_MS}ms, ${DROP_MS + DRAG_MS}ms`,
              }}
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
          </button>
        </div>
      </div>

      {/* Title Block with Zipper Reveal Flaps */}
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