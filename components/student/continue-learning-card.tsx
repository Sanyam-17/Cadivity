"use client"

import { Play, BookOpen, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import Image from "next/image"

interface ContinueLearningCardProps {
  title: string
  slug: string
  thumbnail: string | null
  progress: number
  currentLessonTitle: string | null
  totalLessons: number
  completedLessons: number
  lastActivity: string | null // ISO string (serialized from server)
  instructorName: string | null
}

function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Not started yet"
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export function ContinueLearningCard({
  title,
  slug,
  thumbnail,
  progress,
  currentLessonTitle,
  totalLessons,
  completedLessons,
  lastActivity,
  instructorName,
}: ContinueLearningCardProps) {
  const isNewCourse = progress === 0
  const ctaLabel = isNewCourse ? "Start Learning" : "Continue Learning"
  const CtaIcon = isNewCourse ? BookOpen : Play

  return (
    <Link href={`/courses/${slug}/play`} className="block group">
      <div className="continue-learning-card relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/30">
        {/* Background blur effect using thumbnail */}
        {thumbnail && (
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <Image
              src={thumbnail}
              alt=""
              fill
              className="object-cover blur-3xl scale-150"
              sizes="100vw"
            />
          </div>
        )}

        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {/* Thumbnail */}
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-40">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 160px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
                <BookOpen className="h-8 w-8 text-primary/40" strokeWidth={1.5} />
              </div>
            )}
            {/* Progress overlay on thumbnail */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {isNewCourse ? "🚀 Ready to start" : "🎯 Pick up where you left off"}
                </p>
                <h3 className="mt-1 text-lg font-bold leading-tight text-foreground line-clamp-1 sm:text-xl">
                  {title}
                </h3>
              </div>
            </div>

            {/* Next lesson + meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {currentLessonTitle && (
                <span className="flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-primary" />
                  <span className="truncate max-w-[200px]">Next: {currentLessonTitle}</span>
                </span>
              )}
              <span className="tabular-nums">{completedLessons}/{totalLessons} lessons</span>
              {instructorName && <span>by {instructorName}</span>}
              <span className="text-muted-foreground/60">{getRelativeTime(lastActivity)}</span>
            </div>

            {/* Progress bar + CTA */}
            <div className="mt-1 flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <Progress
                  value={progress}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-gradient-to-r from-primary to-accent student-progress-fill"
                />
              </div>
              <span className="text-sm font-bold tabular-nums text-primary">{Math.round(progress)}%</span>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md transition-all group-hover:bg-primary/90 group-hover:shadow-lg group-hover:scale-105">
                <CtaIcon className="h-3.5 w-3.5" />
                {ctaLabel}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md mt-1">
              <CtaIcon className="h-4 w-4" />
              {ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
