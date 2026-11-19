import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PendingIndicatorProps } from "./types";

export function PendingIndicator({
  message = "PROCESSING REQUEST...",
  className,
  fullScreen = false,
}: PendingIndicatorProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "inline-flex items-center gap-3 rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card/95 px-4 py-2.5 shadow-md backdrop-blur-sm",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-[#F2A63B]" />
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#0E1624]">
        {message}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B14]/40 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

