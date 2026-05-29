"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  UserPlus,
  FileText,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface StudentDetail {
  student: {
    id: string
    name: string
    email: string
    image: string | null
  }
  courses: {
    courseId: string
    courseName: string
    courseThumbnail: string | null
    progressPercent: number
    lessonsCompleted: number
    totalLessons: number
    quizResults: { quizName: string; score: number; passedAt: string }[]
    lastActiveAt: string | null
    enrolledAt: string
  }[]
  timeline: {
    type: "enrollment" | "lesson_complete" | "quiz_attempt"
    label: string
    occurredAt: string
  }[]
}

interface StudentProgressDrawerProps {
  studentId: string | null
  onClose: () => void
}

const timelineIcons = {
  enrollment: UserPlus,
  lesson_complete: CheckCircle2,
  quiz_attempt: FileText,
}

const timelineColors = {
  enrollment: "bg-info/10 text-info",
  lesson_complete: "bg-success/10 text-success",
  quiz_attempt: "bg-warning/10 text-warning",
}

export function StudentProgressDrawer({
  studentId,
  onClose,
}: StudentProgressDrawerProps) {
  const { data, loading } = useApi<StudentDetail>({
    url: `/api/instructor/students/${studentId}`,
    immediate: !!studentId,
  })

  const student = data?.student
  const courses = data?.courses || []
  const timeline = data?.timeline || []

  const initials = student?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  return (
    <Sheet open={!!studentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Student Progress</SheetTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full skeleton-shimmer" />
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded skeleton-shimmer" />
                  <div className="h-4 w-48 rounded skeleton-shimmer" />
                </div>
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-[var(--radius-card)] border border-border p-4 space-y-3">
                  <div className="h-4 w-40 rounded skeleton-shimmer" />
                  <div className="h-2 w-full rounded skeleton-shimmer" />
                  <div className="h-3 w-24 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : student ? (
            <>
              {/* Student Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.image || ""} alt={student.name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>

              {/* Per-course Progress */}
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No course data available.</p>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Course Progress</h4>
                  {courses.map((course) => (
                    <div
                      key={course.courseId}
                      className="rounded-[var(--radius-card)] border border-border p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md bg-muted overflow-hidden shrink-0">
                          {course.courseThumbnail ? (
                            <img
                              src={course.courseThumbnail}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium line-clamp-1">
                            {course.courseName}
                          </h5>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">
                            {course.lessonsCompleted} of {course.totalLessons} lessons
                          </span>
                          <span className="text-xs font-medium">
                            {Math.round(course.progressPercent)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              course.progressPercent >= 100
                                ? "bg-success"
                                : "bg-primary"
                            )}
                            style={{ width: `${Math.min(course.progressPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                        </span>
                        {course.lastActiveAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Active{" "}
                            {formatDistanceToNow(new Date(course.lastActiveAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>

                      {/* Quiz results */}
                      {course.quizResults.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Quiz Scores</p>
                          {course.quizResults.map((q, qi) => (
                            <div key={qi} className="flex items-center justify-between text-xs">
                              <span>{q.quizName}</span>
                              <span className="font-medium">{q.score}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Timeline */}
              {timeline.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Activity Timeline</h4>
                  <div className="space-y-3">
                    {timeline.map((event, i) => {
                      const Icon = timelineIcons[event.type] || UserPlus
                      const color = timelineColors[event.type] || "bg-muted text-muted-foreground"

                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              color
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm">{event.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(event.occurredAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
