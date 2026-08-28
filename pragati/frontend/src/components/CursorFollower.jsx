import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";

// Truck icon trails the cursor. If the mouse stays still for ~1s, it plays
// a small "burst" animation (icon pop + scattering particles) and then
// disappears — reappearing instantly once the mouse moves again.
const IDLE_DELAY_MS = 1000;
const BURST_DURATION_MS = 550;
const PARTICLE_COUNT = 8;

export default function CursorFollower() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [bursting, setBursting] = useState(false);
  const idleTimer = useRef(null);
  const burstTimer = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const clearTimers = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (burstTimer.current) clearTimeout(burstTimer.current);
    };

    const scheduleIdleBurst = () => {
      idleTimer.current = setTimeout(() => {
        setBursting(true);
        burstTimer.current = setTimeout(() => {
          setVisible(false);
          setBursting(false);
        }, BURST_DURATION_MS);
      }, IDLE_DELAY_MS);
    };

    const move = (e) => {
      clearTimers();
      setBursting(false);
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      scheduleIdleBurst();
    };

    const hide = () => {
      clearTimers();
      setVisible(false);
      setBursting(false);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", hide);
    return () => {
      clearTimers();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", hide);
    };
  }, []);

  if (!visible) return null;

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (360 / PARTICLE_COUNT) * i;
    const rad = (angle * Math.PI) / 180;
    const distance = 26;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    return { tx, ty, key: i };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[999]"
      style={{
        transform: `translate3d(${pos.x + 16}px, ${pos.y + 16}px, 0)`,
      }}
    >
      <div
        className="h-8 w-8 rounded-full bg-navy-900 shadow-lg flex items-center justify-center ring-2 ring-saffron-500/60"
        style={{
          animation: bursting ? `cursor-burst-icon ${BURST_DURATION_MS}ms ease-out forwards` : "none",
        }}
      >
        <Truck className="h-4 w-4 text-saffron-500" strokeWidth={2.25} />
      </div>

      {bursting &&
        particles.map((p) => (
          <span
            key={p.key}
            className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-saffron-500"
            style={{
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animation: `cursor-burst-particle ${BURST_DURATION_MS}ms ease-out forwards`,
            }}
          />
        ))}
    </div>
  );
}