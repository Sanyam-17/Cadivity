"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KPITileProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  accentColor?: "blue" | "amber" | "red" | "success" | "warning" | "info"
  loading?: boolean
  cornerBracket?: boolean
  animated?: boolean
}

// Count-up hook with GPU optimization
function useCountUp(targetValue: number, enabled: boolean = true) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    if (!enabled || targetValue === 0) {
      setDisplayValue(targetValue)
      return
    }

    const duration = 700 // 700ms total duration
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      const currentValue = Math.floor(
        startValue + (targetValue - startValue) * easeProgress
      )
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [targetValue, enabled])

  return displayValue
}

export function KPITile({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
  accentColor = "blue",
  loading = false,
  cornerBracket = false,
  animated = true,
}: KPITileProps) {
  const displayValue = useCountUp(value, animated)
  const [hasRendered, setHasRendered] = React.useState(false)

  React.useEffect(() => {
    setHasRendered(true)
  }, [])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 rounded skeleton-shimmer" />
            <div className="h-8 w-20 rounded skeleton-shimmer" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded-full skeleton-shimmer" />
              <div className="h-3 w-20 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  const isPositive = change !== undefined && change >= 0

  const accentColorMap = {
    blue: "from-blue-500/20 to-transparent border-blue-200/50 dark:border-blue-900/50",
    amber: "from-amber-500/20 to-transparent border-amber-200/50 dark:border-amber-900/50",
    red: "from-red-500/20 to-transparent border-red-200/50 dark:border-red-900/50",
    success: "from-green-500/20 to-transparent border-green-200/50 dark:border-green-900/50",
    warning: "from-yellow-500/20 to-transparent border-yellow-200/50 dark:border-yellow-900/50",
    info: "from-blue-400/20 to-transparent border-blue-200/50 dark:border-blue-900/50",
  }

  const iconBackgroundMap = {
    blue: "bg-blue-50 dark:bg-blue-950/30",
    amber: "bg-amber-50 dark:bg-amber-950/30",
    red: "bg-red-50 dark:bg-red-950/30",
    success: "bg-green-50 dark:bg-green-950/30",
    warning: "bg-yellow-50 dark:bg-yellow-950/30",
    info: "bg-blue-50 dark:bg-blue-950/30",
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300",
        "hover:shadow-lg hover:border-opacity-100",
        accentColorMap[accentColor],
        hasRendered && animated && "animate-page-enter"
      )}
    >
      {/* Blueprint grid background - subtle */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Corner bracket accent (top-left) */}
      {cornerBracket && (
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl" />
      )}

      {/* Corner bracket accent (bottom-right) */}
      {cornerBracket && (
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            {title}
          </p>
          <div className="font-mono text-3xl font-bold tracking-tighter text-foreground">
            <span className="text-sm font-normal text-muted-foreground">{prefix}</span>
            {displayValue.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
          </div>

          {change !== undefined && changeLabel && (
            <div className="mt-4 flex items-center gap-2 pt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  isPositive
                    ? "bg-success/10 text-success dark:bg-success/20"
                    : "bg-destructive/10 text-destructive dark:bg-destructive/20"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg",
            "transition-transform duration-300 group-hover:scale-110",
            iconBackgroundMap[accentColor]
          )}
        >
          <Icon className={cn("h-7 w-7", iconColor)} />
        </div>
      </div>
    </div>
  )
}
