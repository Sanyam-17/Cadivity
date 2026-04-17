"use client";

import { useEffect } from "react";

/**
 * Detects when the browser restores a page from bfcache (back-forward cache)
 * and forces a full reload so the server-side auth guard runs again.
 * This prevents a logged-out user from seeing a cached admin/dashboard page
 * by pressing the browser back button.
 */
export function BfcacheGuard() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // event.persisted is true when the page is restored from bfcache
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
