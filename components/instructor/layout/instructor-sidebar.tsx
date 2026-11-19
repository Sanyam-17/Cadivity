"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useInstructorStore } from "@/stores/instructor-store"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCircle,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/instructor" },
  { icon: BookOpen, label: "Courses", href: "/dashboard/instructor/courses" },
  { icon: Users, label: "Students", href: "/dashboard/instructor/students" },
]

const bottomNavItems = [
  { icon: UserCircle, label: "Profile", href: "/dashboard/instructor/profile" },
]

interface InstructorSidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
}

export function InstructorSidebar({ isMobileOpen, setIsMobileOpen }: InstructorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useInstructorStore()

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

  const isActive = (href: string) => {
    if (href === "/dashboard/instructor") return pathname === "/dashboard/instructor"
    return pathname.startsWith(href)
  }

  const renderNavLink = (item: typeof mainNavItems[0]) => {
    const active = isActive(item.href)
    return (
      <Link
        href={item.href}
        className={cn(
          "group/nav flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm font-medium transition-all relative font-mono text-[13px]",
          active
            ? "bg-[#183F7F]/40 text-[#4AB8EA] font-semibold border-l-2 border-[#4AB8EA]"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
        )}
        onClick={() => setIsMobileOpen(false)}
      >
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
  }

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    return (
      <li key={item.href}>
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild className="hidden lg:flex">
              {renderNavLink(item)}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
            {/* Mobile: show normal link */}
            <div className="lg:hidden">{renderNavLink(item)}</div>
          </Tooltip>
        ) : (
          renderNavLink(item)
        )}
      </li>
    )
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
            sidebarCollapsed ? "lg:w-16" : "lg:w-64",
            isMobileOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-5">
            <Link href="/dashboard/instructor" className="flex items-center gap-3 min-w-0">
              <Image
                src="/Cadivity.png"
                alt="Cadivity Logo"
                width={160}
                height={64}
                className={cn(
                  "h-10 sm:h-12 lg:h-14 w-auto object-contain",
                  sidebarCollapsed && "lg:h-8"
                )}
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

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <ul className="space-y-1.5">
              {mainNavItems.map(renderNavItem)}
            </ul>

            {/* Separator */}
            <div className="my-4" />

            {/* Bottom nav items */}
            <ul className="space-y-1.5">
              {bottomNavItems.map(renderNavItem)}
            </ul>
          </nav>

          {/* Footer: Collapse Toggle + Logout */}
          <div className="p-4 space-y-1">
            {/* Collapse toggle (desktop only) */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive transition-colors"
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

