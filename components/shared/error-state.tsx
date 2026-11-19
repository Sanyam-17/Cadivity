"use client"

import { ErrorState as BlueprintErrorState } from "@/components/shared/state/error-state"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "Failed to load data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <BlueprintErrorState
      title={title}
      error={description}
      onRetry={onRetry}
      className={className}
    />
  )
}
