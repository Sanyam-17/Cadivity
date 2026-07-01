"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Mode = "student" | "instructor" | "admin"

interface ModeBadgeProps {
  mode: Mode
  variant?: "solid" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const modeConfig: Record<Mode, { label: string; bgColor: string; textColor: string; borderColor: string; cornerColor: string }> = {
  student: {
    label: "Student",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    cornerColor: "border-blue-500/40 dark:border-blue-400/40",
  },
  instructor: {
    label: "Instructor",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    cornerColor: "border-amber-500/40 dark:border-amber-400/40",
  },
  admin: {
    label: "Administrator",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    cornerColor: "border-red-500/40 dark:border-red-400/40",
  },
}

export function ModeBadge({
  mode,
  variant = "solid",
  size = "md",
  showLabel = true,
  className,
}: ModeBadgeProps) {
  const config = modeConfig[mode]

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }

  const variantClasses = {
    solid: `${config.bgColor} ${config.textColor} border ${config.borderColor}`,
    outline: `border-2 ${config.borderColor} ${config.textColor}`,
    ghost: `${config.textColor}`,
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-semibold tracking-tight",
        "transition-all duration-200 hover:shadow-md",
        sizeClasses[size],
        variantClasses[variant],
        "relative",
        className
      )}
    >
      {/* Corner bracket accent */}
      <div className={cn(
        "absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 rounded-tl opacity-50",
        config.cornerColor
      )} />
      <div className={cn(
        "absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 rounded-br opacity-50",
        config.cornerColor
      )} />

      {/* Mode icon/indicator */}
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          mode === "student" && "bg-blue-500 dark:bg-blue-400",
          mode === "instructor" && "bg-amber-500 dark:bg-amber-400",
          mode === "admin" && "bg-red-500 dark:bg-red-400"
        )}
      />

      {showLabel && config.label}
    </div>
  )
}
