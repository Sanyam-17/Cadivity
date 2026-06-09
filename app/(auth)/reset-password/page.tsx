"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully reset.
          </p>
        </div>
        <Button className="w-full" asChild>
          <Link href="/login">Continue to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 animate-validation-enter">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-focus-ring"
          />
          {password.length > 0 && <PasswordStrength password={password} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-focus-ring"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-destructive animate-validation-enter mt-1">
              Passwords do not match
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  )
}
