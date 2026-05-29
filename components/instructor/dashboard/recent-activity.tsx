"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, CheckCircle2, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityEvent {
  id: string
  type: "enrollment" | "completion"
  studentName: string
  studentAvatar: string | null
  courseName: string
  createdAt: string
}

const eventIcons = {
  enrollment: UserPlus,
  completion: CheckCircle2,
}

const eventColors = {
  enrollment: "bg-info/10 text-info",
  completion: "bg-success/10 text-success",
}

export function RecentActivity() {
  const { data, loading, error, refetch } = useApi<{ events: ActivityEvent[] }>({
    url: "/api/instructor/dashboard/activity",
  })

  const events = data?.events || []

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Student events</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="h-9 w-9 rounded-lg skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 rounded skeleton-shimmer" />
                  <div className="h-3 w-48 rounded skeleton-shimmer" />
                  <div className="h-3 w-16 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent student activity"
            description="Activity will appear here as students engage with your courses."
          />
        ) : (
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {events.map((event) => {
              const Icon = eventIcons[event.type] || Activity
              const colorClass = eventColors[event.type] || "bg-muted text-muted-foreground"
              const initials = event.studentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors row-hover"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {event.type === "enrollment" ? "New Enrollment" : "Course Completed"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {event.studentName} — {event.courseName}
                        </p>
                      </div>
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={event.studentAvatar || ""} alt={event.studentName} />
                        <AvatarFallback className="text-[10px] bg-muted">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
