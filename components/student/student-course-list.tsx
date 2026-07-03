"use client"

import * as React from "react"
import { StudentCourseCard } from "./course-card"
import { BookOpen, LayoutGrid, List } from "lucide-react"
import Link from "next/link"

interface CourseData {
  id: string
  courseId: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  progress: number
  enrolledAt: string
  lastActivity: string | null
  completedAt: string | null
  categoryName: string | null
  instructorName: string | null
  totalLessons: number
  completedLessons: number
  currentLessonTitle: string | null
}

interface StudentCourseListProps {
  courses: CourseData[]
}

export function StudentCourseList({ courses }: StudentCourseListProps) {
  const [view, setView] = React.useState<"grid" | "list">("grid")

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="size-6 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          You&apos;re not enrolled in any courses
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Browse our course catalog to find the right program for you and
          start your learning journey today.
        </p>
        <Link
          href="/courses"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Browse Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* View toggle */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setView("grid")}
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          className={`h-8 w-8 flex items-center justify-center rounded border transition-colors ${
            view === "grid"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/60 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          aria-label="List view"
          aria-pressed={view === "list"}
          className={`h-8 w-8 flex items-center justify-center rounded border transition-colors ${
            view === "list"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/60 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Course grid or list */}
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {courses.map((course) => (
          <StudentCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
