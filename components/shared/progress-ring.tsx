"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  showPercentage?: boolean
  color?: "blue" | "amber" | "red" | "success" | "warning" | "info"
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  showPercentage = true,
  color = "blue",
}: ProgressRingProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / max) * circumference

  // Animate the progress ring
  React.useEffect(() => {
    const duration = 1200
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor((value - startValue) * easeProgress + startValue)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  const colorMap = {
    blue: "stroke-blue-500 dark:stroke-blue-400",
    amber: "stroke-amber-500 dark:stroke-amber-400",
    red: "stroke-red-500 dark:stroke-red-400",
    success: "stroke-green-500 dark:stroke-green-400",
    warning: "stroke-yellow-500 dark:stroke-yellow-400",
    info: "stroke-blue-400 dark:stroke-blue-300",
  }

  const percentageValue = Math.round((value / max) * 100)

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted stroke-opacity-20"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", colorMap[color])}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <div className="text-lg font-bold text-foreground font-mono">
              {displayValue}%
            </div>
          )}
          {label && (
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
              {label}
            </div>
          )}
        </div>
      </div>

      {sublabel && (
        <p className="text-xs text-muted-foreground mt-3 text-center">{sublabel}</p>
      )}
    </div>
  )
}
