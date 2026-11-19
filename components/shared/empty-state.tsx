"use client"

import type { LucideIcon } from "lucide-react"
import { EmptyState as BlueprintEmptyState } from "@/components/shared/state/empty-state"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description = "No items available to display.",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <BlueprintEmptyState
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  )
}
