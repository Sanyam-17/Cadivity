import * as React from "react";
import { cn } from "@/lib/utils";
import type { LoadingSkeletonProps } from "./types";

export function LoadingSkeleton({
  variant = "card",
  count = 3,
  className,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: Math.max(1, count) });

  if (variant === "table") {
    return (
      <div
        className={cn("w-full space-y-2", className)}
        aria-busy="true"
        aria-label="Loading table rows..."
      >
        <div className="h-10 w-full rounded-[2px] bg-muted/60 skeleton-shimmer border border-border/30" />
        {items.map((_, i) => (
          <div
            key={i}
            data-testid="skeleton-row"
            className="flex items-center gap-4 p-3 rounded-[2px] border border-border/20 bg-card/60 skeleton-shimmer"
          >
            <div className="h-4 w-12 rounded-[2px] bg-muted/40" />
            <div className="h-4 flex-1 rounded-[2px] bg-muted/30" />
            <div className="h-4 w-28 rounded-[2px] bg-muted/30" />
            <div className="h-4 w-20 rounded-[2px] bg-muted/30" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "stat") {
    return (
      <div
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
        aria-busy="true"
        aria-label="Loading statistics..."
      >
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card p-6 shadow-sm space-y-3"
          >
            <div className="h-3 w-24 rounded-[2px] bg-muted/60 skeleton-shimmer" />
            <div className="h-8 w-28 rounded-[2px] bg-muted/80 skeleton-shimmer" />
            <div className="h-3 w-16 rounded-[2px] bg-muted/40 skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div
        className={cn("space-y-4 max-w-xl", className)}
        aria-busy="true"
        aria-label="Loading form fields..."
      >
        {items.map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-28 rounded-[2px] bg-muted/60 skeleton-shimmer" />
            <div className="h-10 w-full rounded-[2px] border border-border/40 bg-muted/20 skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  // Default: 'card'
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-busy="true"
      aria-label="Loading cards..."
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card p-5 shadow-sm space-y-4"
        >
          <div className="aspect-video w-full rounded-[2px] bg-muted/50 skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded-[2px] bg-muted/70 skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-[2px] bg-muted/40 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

