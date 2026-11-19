"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingSkeleton } from "./loading-skeleton";
import { PendingIndicator } from "./pending-indicator";
import { DisabledWrapper } from "./disabled-wrapper";
import { UnauthorizedNotice } from "./unauthorized-notice";
import type { StateViewProps } from "./types";

export function StateView({
  state,
  children,
  preserveChildrenOnRefetch = true,
  className,
}: StateViewProps) {
  const hasRenderedChildrenRef = React.useRef(false);

  // If we have rendered children successfully before, we keep them cached for refetch states
  if (state.status === "idle" || state.status === "success") {
    hasRenderedChildrenRef.current = true;
  }

  // 1. Loading State
  if (state.status === "loading") {
    if (preserveChildrenOnRefetch && hasRenderedChildrenRef.current) {
      return (
        <div className={cn("relative", className)} aria-busy="true">
          <div className="absolute top-2 right-2 z-10">
            <PendingIndicator message={state.message || "REFRESHING..."} />
          </div>
          <div className="opacity-75 transition-opacity pointer-events-none">
            {children}
          </div>
        </div>
      );
    }
    return (
      <div className={className} aria-busy="true">
        <LoadingSkeleton variant={state.skeleton} count={state.count} />
      </div>
    );
  }

  // 2. Empty State
  if (state.status === "empty") {
    return (
      <div className={className}>
        <EmptyState
          title={state.title}
          description={state.description}
          actionLabel={state.actionLabel}
          onAction={state.onAction}
        />
      </div>
    );
  }

  // 3. Error State
  if (state.status === "error") {
    if (preserveChildrenOnRefetch && hasRenderedChildrenRef.current) {
      return (
        <div className={cn("space-y-4", className)}>
          <ErrorState
            error={state.error}
            code={state.code}
            onRetry={state.onRetry}
            isRetrying={state.isRetrying}
          />
          <div className="opacity-80">{children}</div>
        </div>
      );
    }
    return (
      <div className={className}>
        <ErrorState
          error={state.error}
          code={state.code}
          onRetry={state.onRetry}
          isRetrying={state.isRetrying}
        />
      </div>
    );
  }

  // 4. Disabled State
  if (state.status === "disabled") {
    return (
      <DisabledWrapper isDisabled={true} reason={state.reason} className={className}>
        {children}
      </DisabledWrapper>
    );
  }

  // 5. Pending State
  if (state.status === "pending") {
    return (
      <div className={cn("relative", className)} aria-busy="true">
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/60 backdrop-blur-xs rounded-[2px]">
          <PendingIndicator message={state.message} />
        </div>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </div>
    );
  }

  // 6. Unauthorized State (401 or 403)
  if (state.status === "unauthorized") {
    return (
      <div className={className}>
        <UnauthorizedNotice
          type={state.type}
          roleRequired={state.roleRequired}
          redirectUrl={state.redirectUrl}
        />
      </div>
    );
  }

  // 7. Idle & Success States
  return (
    <div className={cn("animate-page-enter", className)}>
      {children}
    </div>
  );
}

