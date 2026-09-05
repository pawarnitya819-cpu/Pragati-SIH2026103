import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export default function SectorIllustration({ sector }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (event) => setIsReducedMotion(event.matches);
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Sector-specific configurations
  const sectorConfigs = {
    Railways: {
      colors: {
        track: "#6B7280",
        trainBody: "#EF4444",
        trainWindow: "#FFFFFF",
        trainWheel: "#374151",
        ground: "#3B82F6",
      },
      animation: {
        type: "trainMove",
        duration: 6,
        delay: 0,
      },
    },
    Power: {
      colors: {
        tower: "#6B7280",
        blade: "#15803D",
        bladeHighlight: "#16A34A",
        ground: "#3B82F6",
        sun: "#FBBF24",
      },
      animation: {
        type: "bladeRotate",
        duration: 8,
        delay: 0,
      },
    },
    Waterways: {
      colors: {
        water: "#3B82F6",
        boatHull: "#EF4444",
        boatCabin: "#15803D",
        boatDetail: "#FFFFFF",
        ground: "#1E3A8A",
        sun: "#FBBF24",
      },
      animation: {
        type: "boatBob",
        duration: 5,
        delay: 0,
      },
    },
    // Default fallback for other sectors
    default: {
      colors: {
        primary: "#6B7280",
        secondary: "#EA9316",
        accent: "#15803D",
        ground: "#3B82F6",
      },
      animation: {
        type: "pulse",
        duration: 4,
        delay: 0,
      },
    },
  };

  const config = sectorConfigs[sector] || sectorConfigs.default;
  const shouldAnimate = !isReducedMotion;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Base container for consistent sizing */}
      <div className="relative w-[200px] h-[200px]">
        {shouldAnimate ? (
          <motion.div
            // Animation will be handled by SVG elements themselves
            className="absolute inset-0"
          >
            {/* Render SVG based on sector */}
            {sector === "Railways" && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Railways sector illustration"
                role="img"
              >
                {/* Ground */}
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />

                {/* Tracks */}
                <path
                  d="M20,150 L180,110"
                  stroke={config.colors.track}
                  strokeWidth="4"
                />
                <path
                  d="M40,150 L200,110"
                  stroke={config.colors.track}
                  strokeWidth="4"
                />

                {/* Train Body */}
                <motion.rect
                  x={[{ x: 20 }, { x: 120 }, { x: 20 }]}
                  y="100"
                  width="80"
                  height="30"
                  fill={config.colors.trainBody}
                  transition={{
                    x: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                />

                {/* Train Windows */}
                <rect x="30" y="105" width="20" height="20" fill={config.colors.trainWindow} />
                <rect x="70" y="105" width="20" height="20" fill={config.colors.trainWindow} />
                <rect x="110" y="105" width="20" height="20" fill={config.colors.trainWindow} />

                {/* Train Wheels */}
                <motion.circle
                  cx={[{ cx: 40 }, { cx: 140 }, { cx: 40 }]}
                  cy="140"
                  r="8"
                  fill={config.colors.trainWheel}
                  transition={{
                    cx: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                />
                <motion.circle
                  cx={[{ cx: 100 }, { cx: 200 }, { cx: 100 }]}
                  cy="140"
                  r="8"
                  fill={config.colors.trainWheel}
                  transition={{
                    cx: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                />
              </svg>
            )}

            {sector === "Power" && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Power sector illustration"
                role="img"
              >
                {/* Ground */}
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />

                {/* Tower */}
                <rect x="90" y="50" width="20" height="100" fill={config.colors.tower} />

                {/* Nacelle (hub) */}
                <circle cx="100" cy="50" r="15" fill={config.colors.tower} />

                {/* Sun */}
                <circle cx="160" cy="40" r="12" fill={config.colors.sun} />

                {/* Blades */}
                <motion.g
                  transform-origin="100 50"
                  style={{
                    rotate: [
                      { rotate: 0 },
                      { rotate: 360 },
                      { rotate: 360 }
                    ]
                  }}
                  transition={{
                    rotate: {
                      duration: config.animation.duration,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                >
                  {/* Blade 1 */}
                  <path
                    d="M100,35 L100,5 L110,10 L100,35"
                    fill={config.colors.blade}
                  />
                  <path
                    d="M100,35 L100,5 L90,10 L100,35"
                    fill={config.colors.blade}
                  />

                  {/* Blade 2 */}
                  <path
                    d="M100,35 L150,85 L145,95 L100,35"
                    fill={config.colors.blade}
                  />
                  <path
                    d="M100,35 L150,85 L155,75 L100,35"
                    fill={config.colors.blade}
                  />

                  {/* Blade 3 */}
                  <path
                    d="M100,35 L50,85 L55,95 L100,35"
                    fill={config.colors.blade}
                  />
                  <path
                    d="M100,35 L50,85 L45,75 L100,35"
                    fill={config.colors.blade}
                  />

                  {/* Blade highlights */}
                  <path
                    d="M100,35 L100,20 L105,25 L100,35"
                    fill={config.colors.bladeHighlight}
                  />
                  <path
                    d="M100,35 L130,65 L135,60 L100,35"
                    fill={config.colors.bladeHighlight}
                  />
                  <path
                    d="M100,35 L70,65 L65,70 L100,35"
                    fill={config.colors.bladeHighlight}
                  />
                </motion.g>
              </svg>
            )}

            {sector === "Waterways" && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Waterways sector illustration"
                role="img"
              >
                {/* Water background */}
                <rect x="0" y="100" width="200" height="100" fill={config.colors.water} />

                {/* Water waves */}
                <path
                  d="M0,120 Q50,100 100,120 T200,120 L200,200 L0,200 Z"
                  fill="rgba(59, 130, 246, 0.3)"
                />

                {/* Sun */}
                <circle cx="160" cy="40" r="12" fill={config.colors.sun} />

                {/* Boat */}
                <motion.g
                  y={[{ y: 0 }, { y: -10 }, { y: 0 }]}
                  transition={{
                    y: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                    },
                  }}
                >
                  {/* Boat hull */}
                  <path
                    d="M60,110 Q80,90 100,110 Q120,90 140,110"
                    fill={config.colors.boatHull}
                  />

                  {/* Boat cabin */}
                  <rect x="80" y="80" width="40" height="30" rx="5" fill={config.colors.boatCabin} />

                  {/* Boat details */}
                  <rect x="85" y="85" width="10" height="10" fill={config.colors.boatDetail} />
                  <rect x="105" y="85" width="10" height="10" fill={config.colors.boatDetail} />

                  {/* Mast */}
                  <rect x="98" y="50" width="4" height="30" fill={config.colors.boatDetail} />

                  {/* Sail */}
                  <path
                    d="M100,50 L110,80 L90,80 Z"
                    fill={config.colors.boatDetail}
                    opacity="0.8"
                  />
                </motion.g>

                {/* Distant land */}
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />
              </svg>
            )}

            {/* Default fallback illustration */}
            {!["Railways", "Power", "Waterways"].includes(sector) && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Sector illustration"
                role="img"
              >
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />
                <circle cx="100" cy="100" r="40" fill={config.colors.primary} opacity="0.2" />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill={config.colors.primary}
                  transition={{
                    r: [40, 50, 40],
                    duration: config.animation.duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
                <text
                  x="100"
                  y="110"
                  textAnchor="middle"
                  fill={config.colors.secondary}
                  fontSize="16"
                  fontWeight="bold"
                >
                  {sector}
                </text>
              </svg>
            )}
          </motion.div>
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-lg">
            <span className="text-slate-500 text-center px-4">
              {sector}
              <br />
              Illustration
            </span>
          </div>
        )}
      </div>
    </div>
  );
}