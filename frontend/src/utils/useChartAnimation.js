import { useEffect, useState, useRef } from "react";

/**
 * Hook to animate chart data in - stagger bars/slices sequentially
 * Returns animated data and a ref to attach to the chart container
 */
export function useChartAnimation(data, delay = 50) {
  const [animatedData, setAnimatedData] = useState(
    data.map((d) => ({ ...d, _animated: 0 }))
  );
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const intervals = data.map((_, idx) => {
      return setTimeout(() => {
        setAnimatedData((prev) => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], _animated: 1 };
          return updated;
        });
      }, idx * delay);
    });

    return () => intervals.forEach(clearTimeout);
  }, [inView, data, delay]);

  return { animatedData, ref, inView };
}

/**
 * Hook for progress bar fill animations
 */
export function useProgressAnimation(value, duration = 1000) {
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * value, value);
      setProgress(newProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [started, value, duration]);

  return { progress, ref };
}

/**
 * Custom recharts animation - used in Bar/Pie components
 */
export const chartAnimationConfig = {
  type: "monotone",
  duration: 800,
  easing: "ease-in-out",
  isAnimationActive: true,
};
