"use client"

import * as React from "react"

interface Notification {
  id: string
  type: string
  title: string
  description: string
  read: boolean
  targetUrl: string | null
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (ids: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

const NotificationContext = React.createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refetch: async () => {},
})

export function useNotifications() {
  return React.useContext(NotificationContext)
}

interface NotificationProviderProps {
  children: React.ReactNode
  pollingInterval?: number // ms, default 30s
}

export function NotificationProvider({
  children,
  pollingInterval = 30000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // Silently fail on polling errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling
  React.useEffect(() => {
    const interval = setInterval(fetchNotifications, pollingInterval)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollingInterval])

  const markAsRead = React.useCallback(
    async (ids: string[]) => {
      try {
        await fetch("/api/admin/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        })
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - ids.length))
      } catch {
        // fail silently
      }
    },
    []
  )

  const markAllAsRead = React.useCallback(async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // fail silently
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
