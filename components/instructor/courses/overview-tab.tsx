"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApi, useMutation } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface CourseDetail {
  id: string
  title: string
  description: string | null
  slug: string
  thumbnail: string | null
  status: string
  category: { id: string; name: string } | null
  completionCriteria: string
  seoTitle: string | null
  seoDescription: string | null
  enrolledCount: number
  completionRate: number
  updatedAt: string
  instructor: { id: string; name: string; image: string | null } | null
}

interface OverviewTabProps {
  courseId: string
}

export function OverviewTab({ courseId }: OverviewTabProps) {
  const { data: course, loading, error, refetch } = useApi<CourseDetail>({
    url: `/api/instructor/courses/${courseId}`,
  })

  const [optimisticStatus, setOptimisticStatus] = React.useState<string | null>(null)
  const { mutate, loading: toggling } = useMutation({
    onSuccess: () => {
      refetch()
      toast.success(optimisticStatus === "published" ? "Course published" : "Course unpublished")
    },
    onError: () => {
      setOptimisticStatus(null)
      toast.error("Update failed — reverted")
    },
  })

  const displayStatus = optimisticStatus || course?.status || "draft"
  const isPublished = displayStatus === "published"

  const handleTogglePublish = async () => {
    const newStatus = isPublished ? "draft" : "published"
    setOptimisticStatus(newStatus)
    try {
      await mutate(`/api/instructor/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
    } catch {
      setOptimisticStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
          <div className="h-6 w-48 rounded skeleton-shimmer" />
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-3">
              <div className="h-4 w-20 rounded skeleton-shimmer" />
              <div className="h-8 w-16 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !course) {
    return <ErrorState description={error || "Course not found"} onRetry={refetch} />
  }

  const initials = course.instructor?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  return (
    <div className="space-y-6">
      {/* Course Info Card */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Thumbnail */}
          <div className="h-40 w-full lg:w-64 rounded-lg bg-muted overflow-hidden shrink-0">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{course.title}</h2>
              {course.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={displayStatus as any} />
              {course.category && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                  {course.category.name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                /{course.slug}
              </span>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={isPublished}
                onCheckedChange={handleTogglePublish}
                disabled={toggling}
              />
              <span className="text-sm font-medium">
                {toggling ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </span>
                ) : isPublished ? (
                  "Published"
                ) : (
                  "Draft"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
          <p className="text-xs text-muted-foreground">Enrolled Students</p>
          <p className="mt-2 text-2xl font-bold tabular-nums">{course.enrolledCount}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            Total enrollments
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
          <p className="text-xs text-muted-foreground">Avg Completion</p>
          <p className="mt-2 text-2xl font-bold tabular-nums">{course.completionRate}%</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            Across all students
          </div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="mt-2 text-lg font-semibold">
            {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(course.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Instructor Section */}
      {course.instructor && (
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Instructor</h3>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={course.instructor.image || ""} alt={course.instructor.name} />
              <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{course.instructor.name}</p>
              <p className="text-xs text-muted-foreground">Course Instructor</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
