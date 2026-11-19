"use client"

import * as React from "react"
import { StudentCourseCard } from "./course-card"
import { LayoutGrid, List } from "lucide-react"
import { EmptyState } from "@/components/shared/state/empty-state"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  if (courses.length === 0) {
    return (
      <EmptyState
        eyebrow="NO ENROLLMENTS YET"
        title="Start Your CAD Automation Journey"
        description="Browse our hands-on course catalog to learn Creo Toolkit development, SolidWorks API programming, and CAD automation."
        actionLabel="Explore Programs"
        onAction={() => router.push("/courses")}
      />
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
          className={`h-8 w-8 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
            view === "grid"
              ? "border-[#183F7F] bg-[#183F7F]/10 text-[#183F7F]"
              : "border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card text-[#5B6B7F] hover:text-[#0E1624] hover:bg-muted"
          }`}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          aria-label="List view"
          aria-pressed={view === "list"}
          className={`h-8 w-8 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
            view === "list"
              ? "border-[#183F7F] bg-[#183F7F]/10 text-[#183F7F]"
              : "border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card text-[#5B6B7F] hover:text-[#0E1624] hover:bg-muted"
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
