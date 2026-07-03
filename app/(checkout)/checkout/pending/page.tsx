"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Pending</h1>
        <p className="text-slate-600 leading-relaxed">
          Your payment is currently being processed by the bank. This usually takes a few minutes. We will update your course access automatically once the payment is successful.
        </p>
        <div className="pt-4">
          <Link
            href="/courses"
            className="inline-block w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
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
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/checkout/success?course=${data.courseSlug}`);
        } else {
          alert("Simulation failed");
          setLoading(false);
        }
      }}
      className="inline-block w-full py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors mt-4"
    >
      {loading ? "Simulating..." : "Simulate Success (Dev Only)"}
    </button>
  );
}
