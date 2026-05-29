"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { InstructorSidebar } from "./instructor-sidebar"
import { InstructorTopNav } from "./instructor-top-nav"
import { InstructorNotificationProvider } from "./notification-provider"
import { useInstructorStore } from "@/stores/instructor-store"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstructorLayoutProps {
  children: React.ReactNode
}

export function InstructorLayout({ children }: InstructorLayoutProps) {
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    resolvedTheme,
  } = useInstructorStore()

  // We no longer mutate document.documentElement to prevent global dark theme leaks across different dashboards.
  // Instead, the dark class is applied to the local wrapper.

  return (
    <InstructorNotificationProvider>
      <div className={cn("theme-instructor min-h-screen bg-background text-foreground", resolvedTheme === "dark" && "dark")}>
        <InstructorSidebar
          isMobileOpen={sidebarMobileOpen}
          setIsMobileOpen={setSidebarMobileOpen}
        />
        <InstructorTopNav />

        {/* Mobile hamburger trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-3 top-4 z-30 lg:hidden bg-card shadow-md border border-border h-9 w-9"
          onClick={() => setSidebarMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <main
          className={cn(
            "min-h-screen pt-16 transition-all duration-300",
            sidebarCollapsed ? "lg:pl-16" : "lg:pl-60"
          )}
        >
          <div className="animate-page-enter p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </InstructorNotificationProvider>
  )
}

