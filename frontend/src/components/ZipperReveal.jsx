// Wraps its children (the hero title block) behind a solid navy "fabric"
// panel that reads as part of the hero box background — so on first paint
// the text is completely hidden. A horizontal zipper (teeth + pull tab)
// travels left-to-right across the seam; as it passes, the top and bottom
// fabric flaps retreat, revealing the real content underneath.
//
// Timing is synced to the Ashoka Chakra's drop-bounce animation (see
// tailwind.config.js "chakra-drop", ~1.1s total): the zipper animations
// carry a matching animation-delay so they kick off right around the
// chakra's bounce impact (~0.55s in), as if the impact "pulls" the zipper.

const ZIP_DELAY = "0.55s";
const ZIP_DURATION = "1.3s";
const ZIP_EASE = "cubic-bezier(.65,0,.35,1)";

export default function ZipperReveal({ children }) {
  const zipStyle = {
    animationDelay: ZIP_DELAY,
    animationDuration: ZIP_DURATION,
    animationTimingFunction: ZIP_EASE,
    animationFillMode: "both",
  };

  return (
    <div className="relative overflow-hidden">
      {children}

      {/* Fabric flaps — solid navy so they match the hero box background
          and fully hide the text until the zipper passes. */}
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

      {/* Zipper teeth strip, riding the seam. Clips away in sync with the
          flaps so already-unzipped teeth disappear too. */}
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

      {/* Pull tab, travels left to right along the seam. */}
      <div
        className="absolute top-1/2 z-40 pointer-events-none animate-zip-tab"
        style={{ ...zipStyle, marginTop: "-9px" }}
      >
        <svg viewBox="0 0 20 24" className="h-6 w-5 drop-shadow-md">
          <rect x="7" y="0" width="6" height="9" rx="1.5" fill="#8a93a3" stroke="#0B1F3A" strokeWidth="0.8" />
          <rect x="3" y="8" width="14" height="12" rx="3" fill="#c9d0d9" stroke="#0B1F3A" strokeWidth="1" />
          <rect x="7" y="12" width="6" height="4" rx="2" fill="#0B1F3A" />
        </svg>
      </div>
    </div>
  );
}