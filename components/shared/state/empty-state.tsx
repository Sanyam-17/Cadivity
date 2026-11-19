"use client";

import * as React from "react";
import { FolderOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmptyStateProps } from "./types";

export function EmptyState({
  title,
  description,
  eyebrow = "NO RECORDS FOUND",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[2px]",
        "border border-dashed border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card/60 shadow-sm",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-[var(--cad-sand,#E5E1DA)] text-[var(--cad-cobalt,#183F7F)] mb-4 border border-[var(--cad-hairline,rgba(14,22,36,0.15))]">
        <FolderOpen className="h-6 w-6 stroke-[1.5]" />
      </div>

      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--cad-cobalt,#183F7F)] mb-2">
        — {eyebrow}
      </p>

      <h3 className="font-display text-xl font-bold tracking-tight text-[var(--cad-ink,#0E1624)] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[var(--cad-muted,#5B6B7F)] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-[2px] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] bg-[#F2A63B] text-[#070B14] hover:bg-[#e0952e] active:scale-[0.98] transition-all cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#4AB8EA] focus-visible:outline-offset-2"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

