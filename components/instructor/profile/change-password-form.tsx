"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/client/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Key, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = [
    { label: "Weak", color: "bg-destructive" },
    { label: "Fair", color: "bg-warning" },
    { label: "Strong", color: "bg-chart-4" },
    { label: "Very Strong", color: "bg-success" },
  ]

  return {
    score,
    ...(score > 0 ? levels[score - 1] : { label: "", color: "" }),
  }
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const strength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword === confirmPassword
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSaving(true)
    setError(null)

    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      toast.success("Password changed")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err?.message || "Failed to change password. Check your current password.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-6">
      <h3 className="text-sm font-semibold">Change Password</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current password */}
        <div className="space-y-2">
          <Label className="text-sm">Current Password</Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setError(null)
              }}
              className="pr-10 input-focus-ring"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="space-y-2">
          <Label className="text-sm">New Password</Label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10 input-focus-ring"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      level <= strength.score ? strength.color : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label className="text-sm">Confirm New Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-focus-ring"
            placeholder="Confirm new password"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-destructive animate-validation-enter">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 animate-validation-enter">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={!canSubmit} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
