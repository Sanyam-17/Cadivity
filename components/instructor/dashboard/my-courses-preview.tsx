"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { BookOpen, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CoursePreview {
  id: string
  title: string
  thumbnail: string | null
  status: string
  enrolledCount: number
}

export function MyCoursesPreview() {
  const { data, loading, error, refetch } = useApi<{
    courses: CoursePreview[]
  }>({
    url: "/api/instructor/courses",
    params: { limit: 6 },
  })

  const courses = data?.courses || []

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">My Courses</h3>
            <p className="text-xs text-muted-foreground">Your assigned courses</p>
          </div>
        </div>
        <Link
          href="/dashboard/instructor/courses"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[var(--radius-card)] border border-border p-4 space-y-3">
                <div className="h-32 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-20 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses assigned yet"
            description="Contact your admin to get started."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/instructor/courses/${course.id}`}
                className="group rounded-[var(--radius-card)] border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-32 bg-muted overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={course.status as any} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {course.enrolledCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
