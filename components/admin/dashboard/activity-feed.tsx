"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { UserPlus, BookOpen, GraduationCap, Bell, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApi } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "enrollment" | "registration" | "course_published" | "instructor_assigned"
  title: string
  description: string
  timestamp: string
  avatarName?: string
  avatarImage?: string
}

const activityIcons = {
  enrollment: UserPlus,
  registration: UserPlus,
  course_published: BookOpen,
  instructor_assigned: GraduationCap,
}

const activityColors = {
  enrollment: "bg-success/10 text-success",
  registration: "bg-info/10 text-info",
  course_published: "bg-primary/10 text-primary",
  instructor_assigned: "bg-warning/10 text-warning",
}

export function ActivityFeed() {
  const { data: activities, loading, error, refetch } = useApi<ActivityItem[]>({
    url: "/api/admin/dashboard/activity",
  })

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-subheading">Recent Activity</h3>
            <p className="text-caption text-muted-foreground">Latest updates</p>
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
                  <div className="h-3.5 w-24 rounded skeleton-shimmer" />
                  <div className="h-3 w-48 rounded skeleton-shimmer" />
                  <div className="h-3 w-16 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : !activities || activities.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No recent activity"
            description="Activity will appear here as events occur."
          />
        ) : (
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] || Bell
              const colorClass = activityColors[activity.type] || "bg-muted text-muted-foreground"
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-6 hover:bg-muted/50 transition-colors cursor-pointer row-hover"
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
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {activity.description}
                        </p>
                      </div>
                      {activity.avatarName && (
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage
                            src={activity.avatarImage}
                            alt={activity.avatarName}
                          />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {activity.avatarName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
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

