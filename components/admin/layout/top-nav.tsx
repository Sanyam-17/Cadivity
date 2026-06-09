"use client"

import * as React from "react"
import { Bell, Search, Moon, Sun, User, ChevronDown, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { useAdminStore } from "@/stores/admin-store"
import { useNotifications } from "./notification-provider"
import { NotificationDropdown } from "./notification-dropdown"

export function TopNav() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const { sidebarCollapsed, theme, setTheme, resolvedTheme } = useAdminStore()
  const { unreadCount } = useNotifications()
  const [notifOpen, setNotifOpen] = React.useState(false)

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

  const userName = session?.user?.name || "Admin User"
  const userEmail = session?.user?.email || ""
  const userRole = (session?.user as any)?.role || "admin"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const cycleTheme = () => {
    const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
    const currentIndex = order.indexOf(theme)
    const nextTheme = order[(currentIndex + 1) % order.length]
    setTheme(nextTheme)
  }

  const ThemeIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Sun : Moon

  return (
    <>
      <header
        className={cn(
          "fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6 transition-all duration-300",
          sidebarCollapsed ? "lg:left-16" : "lg:left-60",
          "left-0"
        )}
      >
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-12 lg:ml-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students, courses..."
              className="pl-10 bg-secondary border-0 focus-visible:ring-primary input-focus-ring"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="text-muted-foreground hover:text-foreground h-9 w-9 btn-transition"
            aria-label={`Theme: ${theme}. Click to change.`}
          >
            <ThemeIcon className="h-4.5 w-4.5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground h-9 w-9 btn-transition"
            id="notification-bell"
            aria-label="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-secondary h-9 btn-transition"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session?.user?.image || ""} alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">{userName}</span>
                  <span className="text-[11px] text-muted-foreground capitalize leading-none mt-0.5">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-dropdown-enter">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {userEmail}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notification Dropdown */}
      <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}

