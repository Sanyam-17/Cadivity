"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, UserCog, Terminal } from "lucide-react"
import Link from "next/link"

interface CourseCardData {
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

interface StudentCourseCardProps {
  course: CourseCardData
}

export function StudentCourseCard({ course }: StudentCourseCardProps) {
  const hasStarted = course.progress > 0
  const isCompleted = course.progress === 100

  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
      hasStarted ? "border-slate-200/80 shadow-md" : "border-slate-100 shadow-sm"
    )}>
      {/* ── Hero ── */}
      <div className={cn(
        "relative h-44 w-full shrink-0 flex items-center justify-center overflow-hidden",
        hasStarted
          ? "bg-gradient-to-br from-[#3ea8ff] via-[#1d8cf8] to-[#0b6eff]"
          : "bg-[#f0f3f8]"
      )}>
        {/* Subtle radial glow on the active hero */}
        {hasStarted && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18)_0%,transparent_60%)]" />
        )}

        {/* Center icon */}
        <div className={cn(
          "relative flex items-center justify-center rounded-2xl",
          hasStarted
            ? "h-[72px] w-[72px] bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg"
            : "h-[72px] w-[72px] bg-white shadow-sm border border-slate-100"
        )}>
          {hasStarted ? (
            <UserCog className="size-9 text-white" strokeWidth={1.5} />
          ) : (
            <Terminal className="size-9 text-slate-300" strokeWidth={1.5} />
          )}
        </div>

        {/* Badge */}
        {hasStarted && (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-[#15803d] px-3 py-1 text-[10px] font-bold text-white tracking-wide shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {isCompleted ? "Completed" : "In Progress"}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
        <h3 className={cn(
          "text-[15px] font-bold leading-snug line-clamp-2",
          hasStarted ? "text-slate-900" : "text-slate-400"
        )}>
          {course.title}
        </h3>

        {/* Instructor / Description */}
        <div className="mt-3 min-h-[2.25rem]">
          {hasStarted ? (
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-full bg-slate-100 overflow-hidden shrink-0 ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName || "Amit"}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[12px] text-slate-500 truncate leading-snug">
                Taught by{" "}
                <span className="font-semibold text-slate-800">{course.instructorName || "Instructor"}</span>
              </p>
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">
              {course.description || "Master the art of connecting your CAD toolkits with external databases and cloud…"}
            </p>
          )}
        </div>

        {/* Progress */}
        {hasStarted && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wide">
              <span className="text-[#15803d]">Course Progress</span>
              <span className="text-[#15803d] tabular-nums">{Math.round(course.progress)}%</span>
            </div>
            <div className="h-[5px] w-full bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#15803d] to-[#22c55e] rounded-full transition-all duration-700"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-auto pt-5">
          <Link href={`/courses/${course.slug}/play`} className="block w-full">
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 cursor-pointer",
                hasStarted
                  ? "bg-[#0f1d3d] text-white hover:bg-[#0a1530] shadow-md hover:shadow-lg active:scale-[0.98]"
                  : "border border-slate-200 bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              {hasStarted ? "Continue" : "View Module"}
              {hasStarted && <ArrowRight className="size-4" strokeWidth={2.5} />}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
