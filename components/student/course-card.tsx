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
      "flex flex-col overflow-hidden rounded-[2px] border bg-card transition-all duration-200 hover:shadow-md hover:border-[#183F7F]/40 hover:-translate-y-0.5",
      hasStarted ? "border-[var(--cad-hairline,rgba(14,22,36,0.15))] shadow-sm" : "border-[var(--cad-hairline,rgba(14,22,36,0.1))] opacity-90"
    )}>
      {/* ── Hero ── */}
      <div className={cn(
        "relative h-40 w-full shrink-0 flex items-center justify-center overflow-hidden border-b border-border/40",
        hasStarted
          ? "bg-gradient-to-br from-[#070B14] via-[#0E1624] to-[#183F7F]/60 text-white"
          : "bg-[#070B14]/90 text-slate-300"
      )}>
        {/* Subtle blueprint grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

        {/* Center icon */}
        <div className="relative flex items-center justify-center rounded-[2px] h-14 w-14 bg-white/10 backdrop-blur-xs border border-white/20 shadow-sm">
          {hasStarted ? (
            <UserCog className="size-7 text-[#4AB8EA]" strokeWidth={1.5} />
          ) : (
            <Terminal className="size-7 text-white/50" strokeWidth={1.5} />
          )}
        </div>

        {/* Badge */}
        {hasStarted && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-[2px] bg-[#0E1624]/90 border border-white/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E8B57] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2E8B57]" />
            </span>
            {isCompleted ? "Completed" : "In Progress"}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[15px] font-bold leading-snug line-clamp-2 text-[#0E1624]">
          {course.title}
        </h3>

        {/* Instructor / Description */}
        <div className="mt-3 min-h-[2.25rem]">
          {hasStarted ? (
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-[2px] bg-[#E5E1DA] overflow-hidden shrink-0 border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName || "Amit"}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-mono text-[11px] text-[#5B6B7F] truncate leading-snug">
                Instructor:{" "}
                <span className="font-semibold text-[#0E1624]">{course.instructorName || "Cadivity Faculty"}</span>
              </p>
            </div>
          ) : (
            <p className="text-[12px] text-[#5B6B7F] line-clamp-2 leading-relaxed">
              {course.description || "CAD automation and engineering programming curriculum."}
            </p>
          )}
        </div>

        {/* Progress */}
        {hasStarted && (
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider">
              <span className="text-[#183F7F] uppercase">Progress</span>
              <span className="text-[#0E1624] tabular-nums">{Math.round(course.progress)}%</span>
            </div>
            <div className="h-[4px] w-full bg-[#E5E1DA] rounded-[1px] overflow-hidden">
              <div
                className="h-full bg-[#2E8B57] rounded-[1px] transition-all duration-500"
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
                "w-full flex items-center justify-center gap-2 rounded-[2px] py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer shadow-sm",
                hasStarted
                  ? "bg-[#F2A63B] text-[#070B14] hover:bg-[#e0952e] active:scale-[0.98]"
                  : "border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card text-[#0E1624] hover:bg-muted"
              )}
            >
              {hasStarted ? "Continue Learning" : "View Curriculum"}
              {hasStarted && <ArrowRight className="size-3.5" />}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
