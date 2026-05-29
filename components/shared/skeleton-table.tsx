"use client"

import { cn } from "@/lib/utils"

interface SkeletonTableProps {
  columns?: number
  rows?: number
  className?: string
}

export function SkeletonTable({ columns = 5, rows = 6, className }: SkeletonTableProps) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex gap-6">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded skeleton-shimmer"
            style={{ width: `${60 + Math.random() * 60}px` }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-border last:border-0 px-6 py-4 flex items-center gap-6"
        >
          {/* Avatar + name column */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="h-9 w-9 rounded-full skeleton-shimmer shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-28 rounded skeleton-shimmer" />
              <div className="h-3 w-36 rounded skeleton-shimmer" />
            </div>
          </div>
          {/* Other columns */}
          {Array.from({ length: columns - 2 }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-3.5 rounded skeleton-shimmer"
              style={{ width: `${50 + Math.random() * 50}px` }}
            />
          ))}
          {/* Actions column */}
          <div className="h-8 w-8 rounded skeleton-shimmer ml-auto" />
        </div>
      ))}
    </div>
  )
}
