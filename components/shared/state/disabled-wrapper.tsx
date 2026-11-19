import * as React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisabledWrapperProps } from "./types";

export function DisabledWrapper({
  children,
  isDisabled,
  reason,
  className,
}: DisabledWrapperProps) {
  if (!isDisabled) {
    return <>{children}</>;
  }

  return (
    <div
      aria-disabled="true"
      className={cn("relative group select-none", className)}
    >
      <div className="opacity-40 pointer-events-none filter grayscale-[30%]">
        {children}
      </div>

      {reason && (
        <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-[#0E1624]/90 px-2.5 py-1 text-white shadow-md backdrop-blur-xs">
            <Lock className="h-3 w-3 text-[#F2A63B]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#D3E9EF]">
              {reason}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

