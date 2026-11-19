"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, LogIn, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnauthorizedNoticeProps } from "./types";

export function UnauthorizedNotice({
  type = "unauthenticated",
  roleRequired,
  redirectUrl = "/login",
  className,
}: UnauthorizedNoticeProps) {
  const isForbidden = type === "forbidden";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[2px]",
        "border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card p-8 shadow-sm max-w-xl mx-auto my-8",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-[#183F7F]/10 text-[#183F7F] mb-4 border border-[#183F7F]/20">
        <ShieldAlert className="h-6 w-6" />
      </div>

      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#183F7F] mb-2">
        — {isForbidden ? "PERMISSION RESTRICTED" : "SESSION EXPIRED"}
      </p>

      <h3 className="font-display text-2xl font-bold tracking-tight text-[#0E1624] mb-2">
        {isForbidden
          ? `${roleRequired ? roleRequired.toUpperCase() : "ELEVATED"} ACCESS REQUIRED`
          : "Sign In Required"}
      </h3>

      <p className="text-sm text-[#5B6B7F] max-w-md mb-6 leading-relaxed">
        {isForbidden
          ? `Your current account does not have permission to access this ${roleRequired || "restricted"} view. Please switch to an authorized role or return to your dashboard.`
          : "Your session has expired or you need to authenticate before accessing this workspace."}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {isForbidden ? (
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 rounded-[2px] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] bg-[#183F7F] text-white hover:bg-[#153770] active:scale-[0.98] transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Return to My Dashboard</span>
          </Link>
        ) : (
          <Link
            href={redirectUrl}
            className="inline-flex items-center gap-2 rounded-[2px] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] bg-[#F2A63B] text-[#070B14] hover:bg-[#e0952e] active:scale-[0.98] transition-all font-bold"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In to Continue</span>
          </Link>
        )}
      </div>
    </div>
  );
}

