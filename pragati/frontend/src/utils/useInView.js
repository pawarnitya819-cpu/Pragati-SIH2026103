import { useEffect, useRef, useState } from "react";

// Returns a ref to attach to an element, and whether it has scrolled into
// view yet. Used to delay chart rendering until the chart is actually
// visible, so Recharts' entrance animation plays when the user scrolls to
// it instead of finishing silently while it was still off-screen.
export function useInView(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}