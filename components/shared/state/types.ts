import type { ReactNode } from "react";

export type SkeletonVariant = "table" | "card" | "stat" | "form" | "detail" | "text";

/**
 * Predictable discriminated union representing all 10 essential dashboard states:
 * 1. idle
 * 2. loading
 * 3. success
 * 4. empty
 * 5. error
 * 6. disabled
 * 7. pending
 * 8. offline
 * 9. unauthenticated (401)
 * 10. forbidden / unauthorized (403)
 * With Recovery (Retry) as the operational self-healing mechanism.
 */
export type DashboardState =
  | { status: "idle" }
  | { status: "loading"; skeleton?: SkeletonVariant; count?: number; message?: string }
  | { status: "success"; dataFreshness?: Date; message?: string }
  | { status: "empty"; title: string; description: string; actionLabel?: string; onAction?: () => void }
  | { status: "error"; error: Error | string; code?: string | number; onRetry?: () => void; isRetrying?: boolean }
  | { status: "disabled"; reason?: string }
  | { status: "pending"; message?: string }
  | { status: "offline"; onReconnect?: () => void }
  | { status: "unauthorized"; type: "unauthenticated" | "forbidden"; roleRequired?: string; redirectUrl?: string };

export interface EmptyStateProps {
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export interface ErrorStateProps {
  title?: string;
  error: Error | string;
  code?: string | number;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
  label?: string;
  countdown?: number;
}

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

export interface OfflineBannerProps {
  onReconnect?: () => void;
  className?: string;
}

export interface UnauthorizedNoticeProps {
  type?: "unauthenticated" | "forbidden";
  roleRequired?: string;
  redirectUrl?: string;
  className?: string;
}

export interface PendingIndicatorProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export interface DisabledWrapperProps {
  children: ReactNode;
  isDisabled: boolean;
  reason?: string;
  className?: string;
}

export interface StateViewProps {
  state: DashboardState;
  children: ReactNode;
  /** Keep previously rendered children in DOM while refetching/revalidating */
  preserveChildrenOnRefetch?: boolean;
  className?: string;
}

