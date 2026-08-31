import { useEffect, useRef, useState } from "react";

// Animates a number from 0 up to `target` over `duration` ms using an
// ease-out curve. Re-triggers automatically whenever `target` changes
// (e.g. after a new CSV upload changes the KPI totals).
export function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);

    // Never animate a value the user has asked not to see move — and never
    // leave a non-finite target on screen as a stray "NaN".
    const safeTarget = Number.isFinite(target) ? target : 0;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || duration <= 0) {
      setValue(safeTarget);
      return undefined;
    }

    const step = (timestamp) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(safeTarget * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        setValue(safeTarget);
      }
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
}