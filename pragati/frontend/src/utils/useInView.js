import { useCallback, useEffect, useRef, useState } from "react";

// Returns a ref to attach to an element, and whether it has scrolled into
// view yet. Used to delay chart rendering until the chart is actually
// visible, so Recharts' entrance animation plays when the user scrolls to
// it instead of finishing silently while it was still off-screen.
//
// Uses a *callback* ref rather than an object ref: the observer is wired up
// the moment React attaches the node, so it can't miss an element that
// mounts after the first effect pass. It also does one synchronous
// rect check on attach, so content that is already on screen at mount
// (or a browser where IntersectionObserver misbehaves because an ancestor
// clips overflow) still reports as visible instead of staying stuck at
// `false` forever.

function isOnScreen(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return rect.bottom > 0 && rect.right > 0 && rect.top < vh && rect.left < vw;
}

export function useInView(options = {}) {
  const { threshold = 0.25, rootMargin = "0px", once = true } = options;
  const [inView, setInView] = useState(false);
  const disconnectRef = useRef(null);

  const setRef = useCallback(
    (node) => {
      if (disconnectRef.current) {
        disconnectRef.current();
        disconnectRef.current = null;
      }
      if (!node) return;

      if (isOnScreen(node)) {
        setInView(true);
        if (once) return;
      }

      // Very old browsers / non-DOM test environments: degrade to "visible"
      // rather than leaving the UI permanently in its pre-animation state.
      if (typeof IntersectionObserver === "undefined") {
        setInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(node);
      disconnectRef.current = () => observer.disconnect();
    },
    [threshold, rootMargin, once]
  );

  useEffect(() => {
    return () => {
      if (disconnectRef.current) disconnectRef.current();
    };
  }, []);

  return [setRef, inView];
}
