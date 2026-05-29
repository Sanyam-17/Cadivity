"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image";
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAdminStore } from "@/stores/admin-store"
import { authClient } from "@/lib/client/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
  { icon: Users, label: "Students", href: "/dashboard/admin/students" },
  { icon: BookOpen, label: "Courses", href: "/dashboard/admin/courses" },
  { icon: GraduationCap, label: "Instructors", href: "/dashboard/admin/instructors" },
  { icon: FileText, label: "Audit Logs", href: "/dashboard/admin/audit-logs" },
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
]

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useAdminStore()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          toast.success("Signed out successfully")
        },
        onError: () => {
          toast.error("Failed to sign out")
        },
      },
    })
  }

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-backdrop-enter lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground sidebar-transition",
            // Desktop: responsive width
            sidebarCollapsed ? "lg:w-16" : "lg:w-60",
            // Mobile: full width or hidden
            isMobileOpen
              ? "w-60 translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/dashboard/admin" className="flex items-center gap-3 min-w-0">
              <Image
                src="/Cadivity.png"
                alt="Cadivity Logo"
                width={160}
                height={64}
                className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
                priority
              />

            </Link>
            {/* Mobile close */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard/admin"
                    ? pathname === "/dashboard/admin"
                    : pathname.startsWith(item.href)
                const NavLink = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group/nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary-foreground rounded-r-full transition-all" />
                    )}
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span
                      className={cn(
                        "truncate sidebar-label-transition",
                        sidebarCollapsed && "lg:hidden"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                )

                return (
                  <li key={item.href}>
                    {sidebarCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild className="hidden lg:flex">
                          {NavLink}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                        {/* Mobile: show normal link */}
                        <div className="lg:hidden">{NavLink}</div>
                      </Tooltip>
                    ) : (
                      NavLink
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer: Collapse Toggle + Logout */}
          <div className="border-t border-sidebar-border p-3 space-y-1">
            {/* Collapse toggle (desktop only) */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 shrink-0" />
                  <span className="sidebar-label-transition">Collapse</span>
                </>
              )}
            </button>

            {/* Logout */}
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className={cn("sidebar-label-transition", sidebarCollapsed && "lg:hidden")}>
                      Logout
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Logout
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="sidebar-label-transition">Logout</span>
              </button>
            )}
          </div>
        </aside>
      </>
    </TooltipProvider>
  )
}

