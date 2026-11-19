"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RetryButton } from "./retry-button";
import type { ErrorStateProps } from "./types";

export function ErrorState({
  title = "Operation Failed",
  error,
  code,
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "An unexpected error occurred.";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] border-l-4 border-l-[#D64545] bg-[#fff5f5] p-5 shadow-sm text-left",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#fde8e8] text-[#D64545] border border-[#D64545]/20">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-base font-bold text-[#0E1624]">
              {title}
            </h4>
            {code && (
              <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#fde8e8] text-[#D64545] font-semibold border border-[#D64545]/25">
                {code}
              </span>
            )}
          </div>

          <p className="text-sm text-[#5B6B7F] leading-relaxed">
            {errorMessage}
          </p>

          {onRetry && (
            <div className="pt-3">
              <RetryButton onRetry={onRetry} isRetrying={isRetrying} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

