import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardHeroProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

/** Shared visual anchor for role dashboards; it never owns data fetching. */
export function DashboardHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: DashboardHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[2px] border border-white/10 bg-[#070B14] px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9",
        className,
      )}
    >
      {/* Blueprint radial atmospheric glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#183F7F]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#4AB8EA]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#4AB8EA]">
            <span className="text-[#4AB8EA]/70">—</span>
            {eyebrow}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#A0AEC0] sm:text-base font-light">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div>}
      </div>

      {children && <div className="relative mt-7 border-t border-white/10 pt-5">{children}</div>}
    </section>
  )
}
