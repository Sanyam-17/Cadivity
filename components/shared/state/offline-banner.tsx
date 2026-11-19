"use client";

import * as React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OfflineBannerProps } from "./types";

export function OfflineBanner({ onReconnect, className }: OfflineBannerProps) {
  const [isOffline, setIsOffline] = React.useState(false);
  const [isReconnecting, setIsReconnecting] = React.useState(false);

  React.useEffect(() => {
    // Initial check (client-side only)
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        if (onReconnect) {
          setIsReconnecting(true);
          onReconnect();
          setTimeout(() => setIsReconnecting(false), 1500);
        }
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [onReconnect]);

  if (!isOffline && !isReconnecting) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[2px] px-4 py-2 text-xs font-mono font-medium tracking-wide shadow-xl border",
        isOffline
          ? "bg-[#070B14] text-white border-[#4AB8EA]/30 shadow-[#070B14]/40"
          : "bg-[#eaf6ed] text-[#2E8B57] border-[#2E8B57]/30",
        className
      )}
    >
      {isOffline ? (
        <>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D64545] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D64545]" />
          </div>
          <WifiOff className="h-4 w-4 text-[#4AB8EA]" />
          <span>OFFLINE DETECTED — MUTATIONS PAUSED</span>
          <button
            type="button"
            onClick={() => {
              if (window.navigator.onLine) {
                setIsOffline(false);
                onReconnect?.();
              }
            }}
            className="ml-2 text-[#F2A63B] underline underline-offset-2 hover:text-[#e0952e] cursor-pointer"
          >
            Check status
          </button>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-[#2E8B57]" />
          <span>CONNECTION RESTORED — SYNCING DATA</span>
        </>
      )}
    </div>
  );
}

