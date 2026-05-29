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
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
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

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-caption text-muted-foreground">{title}</p>
          <p className="mt-2 text-display tabular-nums">{value}</p>

          {change !== undefined && changeLabel && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  isPositive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
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
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconColor === "text-success" ? "bg-success/10" :
            iconColor === "text-warning" ? "bg-warning/10" :
            iconColor === "text-info" ? "bg-info/10" :
            iconColor === "text-destructive" ? "bg-destructive/10" :
            "bg-primary/10"
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  )
}
