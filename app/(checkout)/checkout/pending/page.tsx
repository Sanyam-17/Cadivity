"use client";

import Link from "next/link";
import { Clock, ArrowUpRight, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-[var(--cad-cream)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--cad-cream)] border border-[var(--cad-hairline)] rounded-sm p-8 text-center space-y-6 relative">
        {/* Blueprint corner marks */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[var(--cad-hairline)] pointer-events-none" />

        <div className="mx-auto w-14 h-14 rounded-full border-2 border-[var(--cad-amber)]/50 flex items-center justify-center">
          <Clock className="h-7 w-7 text-[var(--cad-amber)]" />
        </div>

        <div className="space-y-2">
          <p className="cad-eyebrow text-[var(--cad-amber)]">STATUS: AWAITING CLEARANCE</p>
          <h1 className="cad-text-h3 text-[var(--cad-ink)]">Payment Pending</h1>
          <p className="text-sm text-[var(--cad-muted)] leading-relaxed" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            Your transaction is currently being confirmed by the banking network. Access will be activated automatically once clearance is received.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/courses"
            className="cad-btn cad-btn-outline border-[var(--cad-hairline)] text-[var(--cad-ink)] w-full inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Courses
          </Link>

          {process.env.NODE_ENV === "development" && (
            <Suspense fallback={null}>
              <SimulateButton />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

function SimulateButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(false);

  if (!orderId) return null;

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await fetch("/api/dev/simulate-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/checkout/success?course=${data.courseSlug}`);
        } else {
          alert("Simulation failed");
          setLoading(false);
        }
      }}
      className="cad-text-mono text-xs uppercase tracking-wider w-full py-2.5 px-3 border border-dashed border-[var(--cad-hairline)] bg-[var(--cad-sand)]/50 text-[var(--cad-ink)] hover:bg-[var(--cad-sand)] rounded-sm transition-colors"
    >
      {loading ? "Simulating Gateway..." : "[DEV ONLY] Simulate Success"}
    </button>
  );
}
