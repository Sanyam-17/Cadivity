import * as React from "react"
import { cn } from "@/lib/utils"

export function getPasswordStrength(password: string): {
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

interface PasswordStrengthProps {
  password?: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getPasswordStrength(password)

  return (
    <div className={cn("space-y-1.5 mt-2", className)}>
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
  )
}
