"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { Loader2, MailCheck, AlertCircle, ArrowUpRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("No verification token provided.")
      return
    }

    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token },
        })

        if (error) {
          setStatus("error")
          setErrorMessage(error.message || "Failed to verify email. The link might be expired.")
        } else {
          setStatus("success")
        }
      } catch (err) {
        setStatus("error")
        setErrorMessage("An unexpected error occurred")
      }
    }

    verify()
  }, [token])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--cad-cobalt)]" />
        <p className="cad-text-mono text-xs uppercase tracking-wider text-[var(--cad-muted)]">Verifying your email...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--cad-error)]/40 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-[var(--cad-error)]" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="cad-eyebrow text-[var(--cad-error)]">VERIFICATION FAILED</p>
          <h1 className="cad-text-h3 text-[var(--cad-ink)]">Verification Failed</h1>
          <p className="text-sm text-[var(--cad-muted)] max-w-sm mx-auto" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            {errorMessage}
          </p>
        </div>
        <Link href="/login" className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] w-full">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Return to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--cad-cobalt)] flex items-center justify-center">
          <MailCheck className="h-6 w-6 text-[var(--cad-cobalt)]" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="cad-eyebrow text-[var(--cad-cobalt)]">STATUS CONFIRMED</p>
        <h1 className="cad-text-h3 text-[var(--cad-ink)]">Email Verified</h1>
        <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
          Your email address has been successfully verified. You can now access all features.
        </p>
      </div>
      <Link href="/login" className="cad-btn cad-btn-cobalt w-full">
        Continue to login
        <ArrowUpRight className="h-4 w-4 ml-1.5" />
      </Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cad-cobalt)]" />
          <p className="cad-text-mono text-xs uppercase tracking-wider text-[var(--cad-muted)]">Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  )
}
