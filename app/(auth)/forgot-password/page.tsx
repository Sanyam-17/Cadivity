"use client"

import * as React from "react"
import { authClient } from "@/lib/client/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, MailCheck } from "lucide-react"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <Button variant="outline" className="w-full gap-2" asChild>
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 animate-validation-enter">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-focus-ring"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || !email}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
