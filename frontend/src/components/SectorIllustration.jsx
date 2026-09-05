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
    Roads: {
      colors: {
        road: "#1E3A8A",
        lane: "#FFFFFF",
        divider: "#FBBF24",
        vehicle: "#EA9316",
        ground: "#3B82F6",
        sun: "#FBBF24",
      },
      animation: {
        type: "vehicleMove",
        duration: 7,
        delay: 0,
      },
    },
    "Urban Infrastructure": {
      colors: {
        building: "#6B7280",
        window: "#FFFFFF",
        door: "#374151",
        ground: "#1E3A8A",
        sun: "#FBBF24",
        vehicle: "#EA9316",
      },
      animation: {
        type: "cityGrowth",
        duration: 10,
        delay: 0,
      },
    },
    Irrigation: {
      colors: {
        canal: "#3B82F6",
        water: "#60A5FA",
        crop: "#16A34A",
        ground: "#1E3A8A",
        sun: "#FBBF24",
      },
      animation: {
        type: "waterFlow",
        duration: 6,
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
                  x="20"
                  y="100"
                  width="80"
                  height="30"
                  fill={config.colors.trainBody}
                  animate={{ x: [20, 120, 20] }}
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
                  cx="40"
                  cy="140"
                  r="8"
                  fill={config.colors.trainWheel}
                  animate={{ cx: [40, 140, 40] }}
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
                  cx="100"
                  cy="140"
                  r="8"
                  fill={config.colors.trainWheel}
                  animate={{ cx: [100, 200, 100] }}
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
                  style={{ transformOrigin: "100px 50px" }}
                  animate={{ rotate: [0, 360] }}
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
                  animate={{ y: [0, -10, 0] }}
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

            {sector === "Roads" && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Roads sector illustration"
                role="img"
              >
                {/* Ground */}
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />

                {/* Road */}
                <rect x="0" y="120" width="200" height="30" fill={config.colors.road} />

                {/* Lane divider */}
                <motion.path
                  d="M0,135 L200,135"
                  stroke={config.colors.divider}
                  strokeWidth="2"
                  strokeDasharray="10,5"
                  animate={{ strokeDashoffset: [0, 15, 0] }}
                  transition={{
                    strokeDashoffset: {
                      duration: config.animation.duration,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                />

                {/* Vehicle */}
                <motion.g
                  animate={{ x: [-20, 220, -20] }}
                  transition={{
                    x: {
                      duration: config.animation.duration,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                >
                  {/* Vehicle body */}
                  <rect x="0" y="100" width="40" height="20" rx="3" fill={config.colors.vehicle} />

                  {/* Wheels */}
                  <circle cx="10" cy="125" r="5" fill={config.colors.ground} />
                  <circle cx="30" cy="125" r="5" fill={config.colors.ground} />
                </motion.g>

                {/* Sun */}
                <circle cx="160" cy="40" r="12" fill={config.colors.sun} />
              </svg>
            )}

            {sector === "Urban Infrastructure" && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Urban Infrastructure sector illustration"
                role="img"
              >
                {/* Ground */}
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />

                {/* Buildings */}
                <motion.g
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    x: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                    },
                  }}
                >
                  {/* Building 1 */}
                  <rect x="20" y="80" width="30" height="70" rx="3" fill={config.colors.building} />
                  <rect x="25" y="85" width="5" height="10" fill={config.colors.window} />
                  <rect x="25" y="100" width="5" height="10" fill={config.colors.window} />
                  <rect x="25" y="115" width="5" height="10" fill={config.colors.window} />

                  {/* Building 2 */}
                  <rect x="85" y="60" width="30" height="90" rx="3" fill={config.colors.building} />
                  <rect x="90" y="65" width="5" height="10" fill={config.colors.window} />
                  <rect x="90" y="80" width="5" height="10" fill={config.colors.window} />
                  <rect x="90" y="95" width="5" height="10" fill={config.colors.window} />
                  <rect x="90" y="110" width="5" height="10" fill={config.colors.window} />

                  {/* Building 3 */}
                  <rect x="150" y="70" width="30" height="80" rx="3" fill={config.colors.building} />
                  <rect x="155" y="75" width="5" height="10" fill={config.colors.window} />
                  <rect x="155" y="90" width="5" height="10" fill={config.colors.window} />
                  <rect x="155" y="105" width="5" height="10" fill={config.colors.window} />
                </motion.g>

                {/* Road */}
                <rect x="0" y="140" width="200" height="10" fill={config.colors.ground} />

                {/* Vehicle */}
                <motion.g
                  animate={{ x: [-20, 220, -20] }}
                  transition={{
                    x: {
                      duration: config.animation.duration,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                >
                  {/* Vehicle body */}
                  <rect x="0" y="120" width="30" height="15" rx="2" fill={config.colors.vehicle} />

                  {/* Wheels */}
                  <circle cx="8" cy="140" r="3" fill={config.colors.ground} />
                  <circle cx="22" cy="140" r="3" fill={config.colors.ground} />
                </motion.g>

                {/* Sun */}
                <circle cx="160" cy="40" r="12" fill={config.colors.sun} />
              </svg>
            )}

            {sector === "Irrigation" && (
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Irrigation sector illustration"
                role="img"
              >
                {/* Ground */}
                <rect x="0" y="150" width="200" height="50" fill={config.colors.ground} />

                {/* Canal */}
                <motion.path
                  d="M0,130 Q50,110 100,130 T200,130"
                  fill="none"
                  stroke={config.colors.canal}
                  strokeWidth="8"
                  animate={{
                    d: [
                      "M0,130 Q50,110 100,130 T200,130",
                      "M0,130 Q50,150 100,130 T200,130",
                      "M0,130 Q50,110 100,130 T200,130"
                    ],
                  }}
                  transition={{
                    d: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                    },
                  }}
                />

                {/* Water flow */}
                <motion.path
                  d="M0,130 Q50,110 100,130 T200,130"
                  fill="none"
                  stroke={config.colors.water}
                  strokeWidth="4"
                  opacity="0.7"
                  animate={{
                    d: [
                      "M0,130 Q50,110 100,130 T200,130",
                      "M0,130 Q50,150 100,130 T200,130",
                      "M0,130 Q50,110 100,130 T200,130"
                    ],
                  }}
                  transition={{
                    d: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                    },
                  }}
                />

                {/* Crops */}
                <motion.g
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    y: {
                      duration: config.animation.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                    },
                  }}
                >
                  {/* Crop rows */}
                  <rect x="20" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="40" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="60" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="80" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="100" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="120" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="140" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="160" y="100" width="5" height="30" fill={config.colors.crop} />
                  <rect x="180" y="100" width="5" height="30" fill={config.colors.crop} />
                </motion.g>

                {/* Sun */}
                <circle cx="160" cy="40" r="12" fill={config.colors.sun} />
              </svg>
            )}

            {/* Default fallback illustration */}
            {!["Railways", "Power", "Waterways", "Roads", "Urban Infrastructure", "Irrigation"].includes(sector) && (
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