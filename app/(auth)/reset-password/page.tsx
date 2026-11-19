"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, CheckCircle2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { PasswordStrength } from "@/components/shared/password-strength"

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  
  const passwordsMatch = password === confirmPassword
  const canSubmit = password.length >= 8 && passwordsMatch && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
      })

      if (resetError) {
        setError(resetError.message || "Failed to reset password. The link might be expired.")
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
            <CheckCircle2 className="h-6 w-6 text-[var(--cad-cobalt)]" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="cad-text-h3 text-[var(--cad-ink)]">Password reset</h1>
          <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            Your password has been successfully reset.
          </p>
        </div>
        <Link href="/login" className="cad-btn cad-btn-cobalt w-full">
          Continue to login
          <ArrowUpRight className="h-4 w-4 ml-1.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="cad-eyebrow text-[var(--cad-cobalt)]">ACCOUNT SECURITY</p>
        <h1 className="cad-text-h3 text-[var(--cad-ink)]">Set new password</h1>
        <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="cad-card bg-[var(--cad-error)]/5 px-4 py-3 text-sm text-[var(--cad-error)] border-[var(--cad-error)]/20" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="password" className="cad-input-label">New Password</label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-sm"
          />
          {password.length > 0 && <PasswordStrength password={password} />}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm" className="cad-input-label">Confirm Password</label>
          <Input
            id="confirm"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-sm"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-[var(--cad-error)] mt-1" style={{ fontFamily: "var(--font-mono), monospace" }}>
              Passwords do not match
            </p>
          )}
        </div>

        <button type="submit" className="cad-btn cad-btn-cobalt w-full" disabled={!canSubmit}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Resetting..." : "Reset password"}
          {!loading && <ArrowUpRight className="h-4 w-4 ml-1.5" />}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="cad-text-mono text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
