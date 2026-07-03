"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type CourseStatusFilter = "all" | "in-progress" | "completed" | "not-started"

interface CourseFilterBarProps {
  activeFilter: CourseStatusFilter
  onFilterChange: (filter: CourseStatusFilter) => void
  resultCount: number
  totalCount: number
}

const filters: { key: CourseStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "not-started", label: "Not Started" },
]

export function CourseFilterBar({
  activeFilter,
  onFilterChange,
  resultCount,
  totalCount,
}: CourseFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
              activeFilter === filter.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        Showing {resultCount} of {totalCount} course{totalCount !== 1 ? "s" : ""}
        {activeFilter !== "all" && (
          <span>
            {" "}· Filtered by{" "}
            <span className="font-medium text-foreground">
              {filters.find((f) => f.key === activeFilter)?.label}
            </span>
          </span>
        )}
      </p>
    </div>
  )
}
