"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type StatusVariant =
  | "active"
  | "published"
  | "draft"
  | "pending"
  | "inactive"
  | "deactivated"
  | "unassigned"
  | "archived"

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  published: {
    label: "Published",
    className: "bg-success/10 text-success border-success/20",
  },
  draft: {
    label: "Draft",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  deactivated: {
    label: "Deactivated",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  unassigned: {
    label: "Unassigned",
    className: "bg-muted text-muted-foreground border-border",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
