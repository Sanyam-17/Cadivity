"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/auth/useAuthModal";
import { authClient } from "@/lib/auth-client";

/**
 * Thin client component that:
 * 1. Auto-opens the LoginModal when mounted on /login
 * 2. Redirects authenticated users to their dashboard
 * 3. Redirects unauthenticated users back to "/" when they close the modal
 *
 * Renders nothing — the modal itself lives in app/layout.tsx.
 */
export function LoginModalTrigger() {
  const router = useRouter();
  const { open, isOpen } = useAuthModal();
  const { data: session, isPending } = authClient.useSession();

  // Track whether we've actually opened the modal at least once,
  // so we don't redirect on the initial render (isOpen starts false).
  const hasOpened = useRef(false);

  // Step 1: decide what to do once auth state is known
  useEffect(() => {
    if (isPending) return;

    if (session) {
      // Already signed in — send to the correct dashboard
      const role = (session.user as any)?.role;
      if (role === "admin") router.replace("/admin");
      else if (role === "instructor") router.replace("/dashboard/instructor");
      else router.replace("/dashboard/student");
      return;
    }

    // Not signed in — open modal
    open();
    hasOpened.current = true;
  }, [isPending, session, open, router]);

  // Step 2: when the modal is dismissed, go home
  useEffect(() => {
    if (!hasOpened.current) return; // modal hasn't been opened yet
    if (isPending || session) return; // still loading or now signed in
    if (!isOpen) {
      router.replace("/");
    }
  }, [isOpen, isPending, session, router]);

  return null; // renders nothing — modal is in layout
}
