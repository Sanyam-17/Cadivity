"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RetryButtonProps } from "./types";

export function RetryButton({
  onRetry,
  isRetrying = false,
  className,
  label = "Retry Connection",
  countdown,
}: RetryButtonProps) {
  const [cooldown, setCooldown] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRetrying || cooldown) return;

    setCooldown(true);
    onRetry();

    // Prevent rapid double-clicks for 800ms
    setTimeout(() => {
      setCooldown(false);
    }, 800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRetrying || cooldown}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[2px] px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer",
        "bg-[#F2A63B] text-[#070B14] hover:bg-[#e0952e] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#4AB8EA] focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <RefreshCw
        className={cn("h-3.5 w-3.5", (isRetrying || cooldown) && "animate-spin")}
      />
      <span>
        {isRetrying
          ? "Retrying..."
          : countdown !== undefined && countdown > 0
          ? `${label} (${countdown}s)`
          : label}
      </span>
    </button>
  );
}

