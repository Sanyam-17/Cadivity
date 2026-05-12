"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal hook using IntersectionObserver.
 * Returns a ref to attach to the element and a `visible` boolean.
 * Once visible, stays visible (no re-hiding on scroll away).
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}
