"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Shared singleton IntersectionObserver — one observer for the entire page.
 *
 * Benefits vs one observer per element:
 *  - Eliminates GC pressure at 50+ course cards
 *  - Avoids the viewport-already-visible bug: checks immediately on attach
 *  - Single rAF tick overhead instead of N
 */

type Callback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const callbackMap = new Map<Element, Callback>();

function getSharedObserver(threshold: number): IntersectionObserver {
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = callbackMap.get(entry.target);
          if (cb) {
            cb();
            callbackMap.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
          }
        }
      }
    },
    { threshold }
  );

  return sharedObserver;
}

/**
 * Scroll-reveal hook.
 * - Uses a page-level singleton IntersectionObserver (no N-observer overhead).
 * - Immediately marks as visible if the element is already in the viewport
 *   when the hook mounts (fixes the "content always invisible" bug).
 * - Falls back to visible:true if IntersectionObserver is unsupported.
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    // SSR / unsupported browser fallback
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    // Check if already in viewport RIGHT NOW (fixes the opacity-0 trap)
    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (inViewport) {
      setVisible(true);
      return;
    }

    // Register with the singleton observer
    const obs = getSharedObserver(threshold);
    callbackMap.set(el, () => setVisible(true));
    obs.observe(el);

    return () => {
      callbackMap.delete(el);
      obs.unobserve(el);
    };
    // threshold is stable across renders; no need to re-register
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible };
}
