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
    // Robust fallback: Force visibility to true after 600ms to guarantee content is never blank
    const timer = setTimeout(() => {
      setVisible(true);
    }, 600);

    const el = ref.current;
    if (!el) {
      return () => clearTimeout(timer);
    }

    // Server-side safety or non-supported environment fallback
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      clearTimeout(timer);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          clearTimeout(timer);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);

    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [threshold]);

  return { ref, visible };
}
