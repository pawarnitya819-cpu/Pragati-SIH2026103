import { useEffect, useState } from "react";

// A small icon that trails the mouse cursor across the site.
// Purely decorative — hidden automatically on touch devices.
export default function CursorFollower() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const hide = () => setVisible(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[999] transition-transform duration-150 ease-out"
      style={{
        transform: `translate3d(${pos.x + 14}px, ${pos.y + 14}px, 0)`,
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="text-2xl select-none drop-shadow-md">🚧</span>
    </div>
  );
}