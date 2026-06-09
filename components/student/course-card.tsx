"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Clock, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { EnrolledCourse } from "@/lib/services/student.service";

interface StudentCourseCardProps {
  course: EnrolledCourse;
}

function getStatusConfig(course: EnrolledCourse) {
  if (course.completedAt) {
    return {
      label: "Completed",
      variant: "default" as const,
      className: "bg-emerald-500/90 text-white border-emerald-500/20",
      icon: CheckCircle2,
    };
  }
  if (course.progress > 0) {
    return {
      label: "In Progress",
      variant: "default" as const,
      className: "bg-indigo-500/90 text-white border-indigo-500/20 student-badge-pulse",
      icon: Play,
    };
  }
  return {
    label: "New",
    variant: "default" as const,
    className: "bg-teal-500/90 text-white border-teal-500/20 student-badge-pulse",
    icon: Clock,
  };
}

function getButtonConfig(course: EnrolledCourse) {
  if (course.completedAt) {
    return { label: "Review Course", icon: BookOpen };
  }
  if (course.progress > 0) {
    return { label: "Continue Learning", icon: Play };
  }
  return { label: "Start Course", icon: Play };
}

export function StudentCourseCard({ course }: StudentCourseCardProps) {
  const status = getStatusConfig(course);
  const button = getButtonConfig(course);
  const StatusIcon = status.icon;
  const ButtonIcon = button.icon;

  return (
    <div
      className={cn(
        "student-course-card student-card-enter",
        "group flex flex-col overflow-hidden rounded-xl",
        "bg-card border border-border/60",
        "shadow-sm"
      )}
    >
      {/* ─── Thumbnail Area ─── */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          /* Placeholder gradient when no thumbnail */
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary flex items-center justify-center">
            <BookOpen className="size-12 text-primary/30" strokeWidth={1.5} />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="student-thumbnail-overlay absolute inset-0 pointer-events-none" />

        {/* Status Badge — top-left */}
        <Badge
          className={cn(
            "absolute top-3 left-3 gap-1 px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-sm",
            status.className
          )}
        >
          <StatusIcon className="size-3" />
          {status.label}
        </Badge>
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <h3 className="text-base font-bold leading-snug text-card-foreground line-clamp-1">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 min-h-[2.625rem]">
          {course.description || "No description available."}
        </p>

        {/* ─── Progress ─── */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                course.completedAt
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-primary"
              )}
            >
              {Math.round(course.progress)}%
            </span>
          </div>
          <Progress
            value={course.progress}
            className="h-2 bg-muted"
            indicatorClassName={cn(
              "student-progress-fill",
              course.completedAt
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-primary to-accent"
            )}
          />
        </div>

        {/* ─── Action Button ─── */}
        <Link href={`/courses/${course.slug}/play`} className="block w-full">
          <Button
            className="mt-1 w-full gap-2 cursor-pointer"
            size="default"
            variant={course.completedAt ? "outline" : "default"}
          >
            <ButtonIcon className="size-4" />
            {button.label}
          </Button>
        </Link>
      </div>
    </div>
  );
}
