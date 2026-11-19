"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, MailCheck, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await (authClient.forgetPassword as any)({
        email,
        redirectTo: "/reset-password",
      })

      if (resetError) {
        setError(resetError.message || "Failed to send reset email")
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--cad-cobalt)] flex items-center justify-center">
            <MailCheck className="h-6 w-6 text-[var(--cad-cobalt)]" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="cad-text-h3 text-[var(--cad-ink)]">Check your email</h1>
          <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            We&apos;ve sent a password reset link to <span className="font-medium text-[var(--cad-ink)]">{email}</span>.
          </p>
        </div>
        <Link href="/login" className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] w-full">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="cad-eyebrow text-[var(--cad-cobalt)]">ACCOUNT RECOVERY</p>
        <h1 className="cad-text-h3 text-[var(--cad-ink)]">Forgot password</h1>
        <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="cad-card bg-[var(--cad-error)]/5 px-4 py-3 text-sm text-[var(--cad-error)] border-[var(--cad-error)]/20" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="cad-input-label">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-sm"
          />
        </div>

        <button type="submit" className="cad-btn cad-btn-cobalt w-full" disabled={loading || !email}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="cad-text-mono text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
