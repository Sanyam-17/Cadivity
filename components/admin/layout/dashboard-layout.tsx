"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { NotificationProvider } from "./notification-provider"
import { useAdminStore } from "@/stores/admin-store"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    resolvedTheme,
  } = useAdminStore()

  // We no longer mutate document.documentElement to prevent global dark theme leaks across different dashboards.
  // Instead, the dark class is applied to the local wrapper.

  return (
    <NotificationProvider>
      <div className={cn("theme-admin min-h-screen bg-background text-foreground", resolvedTheme === "dark" && "dark")}>
        <Sidebar
          isMobileOpen={sidebarMobileOpen}
          setIsMobileOpen={setSidebarMobileOpen}
        />
        <TopNav />

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
    </NotificationProvider>
  )
}

