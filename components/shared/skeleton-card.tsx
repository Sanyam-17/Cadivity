"use client"

import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-border bg-card p-6", className)}>
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
      <div className="mt-4 flex h-8 items-end gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t skeleton-shimmer"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  )
}
