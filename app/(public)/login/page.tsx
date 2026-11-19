import { HomePageContent } from "@/components/home/HomePageContent";
import { LoginModalTrigger } from "@/components/auth/LoginModalTrigger";

/**
 * /login — Dedicated login page.
 *
 * Renders the full home page as background so users always see meaningful
 * content. The <LoginModalTrigger /> (client component) fires the global
 * LoginModal (mounted in app/layout.tsx) automatically on mount.
 *
 * Flows:
 *  • Already authenticated → immediately redirected to their dashboard.
 *  • Not authenticated     → modal opens over the home background.
 *  • User dismisses modal  → redirected back to "/" so URL stays clean.
 */
export default function LoginPage() {
  return (
    <>
      {/* Full home page visible behind the modal */}
      <HomePageContent />

      {/* Client-only: opens the modal & handles redirects */}
      <LoginModalTrigger />
    </>
  );
}
