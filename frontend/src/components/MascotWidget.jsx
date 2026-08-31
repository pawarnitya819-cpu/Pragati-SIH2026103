import { useEffect, useRef, useState } from "react";

const EYE_MOVE_RADIUS = 3;

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
      const scaleX = rect.width / 160;
      const scaleY = rect.height / 220;
      const leftEye = { x: rect.left + 88 * scaleX, y: rect.top + 62 * scaleY };
      const rightEye = { x: rect.left + 110 * scaleX, y: rect.top + 62 * scaleY };

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
      className="fixed z-[900] pointer-events-none select-none hidden md:block mascot-idle"
      style={{ width: 128, height: 176, top: "48%", left: -30, transform: "translateY(-50%)" }}
    >
      <svg viewBox="0 0 160 220" width="128" height="176">
        <path
          d="M60 70 C40 55, 30 40, 34 20"
          stroke="#F5C99B"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="34" cy="18" r="10" fill="#F5C99B" stroke="#0A192F" strokeWidth="2" />

        <path d="M40 95 Q45 150 70 210 L130 210 Q140 150 118 95 Z" fill="#1E3A8A" />
        <path d="M55 100 L90 210 L100 210 L68 98 Z" fill="#D97706" opacity="0.9" />

        <path
          d="M108 110 C122 140, 120 165, 108 185"
          stroke="#F5C99B"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />
        <g transform="translate(96 178) rotate(20)">
          <rect x="-5" y="0" width="10" height="34" rx="4" fill="#94A3B8" />
          <circle cx="0" cy="-4" r="9" fill="none" stroke="#94A3B8" strokeWidth="6" />
        </g>

        <circle cx="99" cy="68" r="36" fill="#F5C99B" stroke="#0A192F" strokeWidth="2" />

        <path d="M63 58 a36 32 0 0 1 72 0 z" fill="#D97706" stroke="#0A192F" strokeWidth="2" />
        <rect x="59" y="55" width="80" height="9" rx="4.5" fill="#B45309" />

        <circle cx="88" cy="62" r="7" fill="white" stroke="#0A192F" strokeWidth="1.5" />
        <circle cx="110" cy="62" r="7" fill="white" stroke="#0A192F" strokeWidth="1.5" />
        <circle cx={88 + leftPupil.x} cy={62 + leftPupil.y} r="3" fill="#0A192F" />
        <circle cx={110 + rightPupil.x} cy={62 + rightPupil.y} r="3" fill="#0A192F" />

        <path
          d="M86 82 Q99 92 112 82"
          stroke="#0A192F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}