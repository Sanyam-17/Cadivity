"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  loading?: boolean
}

/** Map iconColor prop to the two-color system: blue (primary), teal (success), amber (warning). */
function getIconChipClasses(iconColor: string) {
  switch (iconColor) {
    case "text-success":
      return { bg: "bg-[hsl(175,70%,40%)]/10", fg: "text-success" }
    case "text-warning":
      return { bg: "bg-warning/10", fg: "text-warning" }
    case "text-info":
    case "text-primary":
    default:
      return { bg: "bg-primary/8", fg: "text-primary" }
  }
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-24 rounded-[2px] skeleton-shimmer" />
            <div className="h-9 w-20 rounded-[2px] skeleton-shimmer" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded-[2px] skeleton-shimmer" />
              <div className="h-3 w-20 rounded-[2px] skeleton-shimmer" />
            </div>
          </div>
          <div className="h-10 w-10 rounded-[2px] skeleton-shimmer" />
        </div>
      </div>
    )
  }

  const isPositive = change !== undefined && change >= 0
  const chip = getIconChipClasses(iconColor)

  return (
    <div className="group relative overflow-hidden rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-[#183F7F]/30 hover:-translate-y-0.5">
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#5B6B7F]">{title}</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[#0E1624] tracking-tight">{value}</p>

          {change !== undefined && changeLabel && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 rounded-[2px] px-2 py-0.5 font-mono text-[10px] font-semibold",
                  isPositive
                    ? "bg-[#eaf6ed] text-[#2E8B57]"
                    : "bg-[#fde8e8] text-[#D64545]"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="font-mono text-[11px] text-[#5B6B7F]">{changeLabel}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-border/40",
            chip.bg
          )}
        >
          <Icon className={cn("h-5 w-5", chip.fg)} />
        </div>
      </div>
    </div>
  )
}
