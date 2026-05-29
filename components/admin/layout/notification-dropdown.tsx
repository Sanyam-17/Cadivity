"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useNotifications } from "./notification-provider"
import { useRouter } from "next/navigation"
import {
  UserPlus,
  BookOpen,
  GraduationCap,
  Bell,
  AlertCircle,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

const typeIcons: Record<string, React.ElementType> = {
  enrollment: UserPlus,
  course_published: BookOpen,
  registration: UserPlus,
  instructor_assigned: GraduationCap,
  system: AlertCircle,
}

const typeColors: Record<string, string> = {
  enrollment: "bg-success/10 text-success",
  course_published: "bg-primary/10 text-primary",
  registration: "bg-info/10 text-info",
  instructor_assigned: "bg-warning/10 text-warning",
  system: "bg-muted text-muted-foreground",
}

interface NotificationDropdownProps {
  open: boolean
  onClose: () => void
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications()
  const router = useRouter()
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest("#notification-bell")
      ) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead([notification.id])
    }
    if (notification.targetUrl) {
      router.push(notification.targetUrl)
    }
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      className="fixed right-4 top-14 z-50 w-[360px] rounded-[var(--radius-modal)] border border-border bg-card shadow-xl animate-dropdown-enter max-h-[480px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={markAllAsRead}
          >
            <Check className="mr-1.5 h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded skeleton-shimmer" />
                  <div className="h-3 w-48 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">You're all caught up</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No new notifications
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell
              const colorClass =
                typeColors[notification.type] || "bg-muted text-muted-foreground"

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/3"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm line-clamp-1",
                          !notification.read && "font-medium"
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
