import { useEffect, useRef, useState } from "react";

const EYE_MOVE_RADIUS = 3.2;

export default function MascotWidget() {
  const containerRef = useRef(null);
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const pupilOffset = (eyeX, eyeY, mouseX, mouseY) => {
      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(EYE_MOVE_RADIUS, Math.hypot(dx, dy) / 15);
      return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };

    const handleMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scaleX = rect.width / 120;
      const scaleY = rect.height / 140;
      const leftEye = { x: rect.left + 46 * scaleX, y: rect.top + 62 * scaleY };
      const rightEye = { x: rect.left + 74 * scaleX, y: rect.top + 62 * scaleY };

      setLeftPupil(pupilOffset(leftEye.x, leftEye.y, e.clientX, e.clientY));
      setRightPupil(pupilOffset(rightEye.x, rightEye.y, e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed bottom-4 left-4 z-[900] pointer-events-none select-none hidden sm:block mascot-idle"
      style={{ width: 84, height: 98 }}
    >
      <svg viewBox="0 0 120 140" width="84" height="98">
        <rect x="30" y="95" width="60" height="40" rx="10" fill="#1E3A8A" />
        <rect x="38" y="95" width="10" height="30" fill="#D97706" />
        <rect x="72" y="95" width="10" height="30" fill="#D97706" />

        <circle cx="60" cy="65" r="34" fill="#F5C99B" stroke="#0A192F" strokeWidth="2" />

        <path d="M26 55 a34 30 0 0 1 68 0 z" fill="#D97706" stroke="#0A192F" strokeWidth="2" />
        <rect x="22" y="52" width="76" height="8" rx="4" fill="#B45309" />

        <circle cx="46" cy="62" r="8" fill="white" stroke="#0A192F" strokeWidth="1.5" />
        <circle cx="74" cy="62" r="8" fill="white" stroke="#0A192F" strokeWidth="1.5" />

        <circle cx={46 + leftPupil.x} cy={62 + leftPupil.y} r="3.5" fill="#0A192F" />
        <circle cx={74 + rightPupil.x} cy={62 + rightPupil.y} r="3.5" fill="#0A192F" />

        <path
          d="M48 80 Q60 90 72 80"
          stroke="#0A192F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}