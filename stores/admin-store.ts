"use client"

import { create } from "zustand"

interface AdminUIState {
  // Sidebar
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void

  // Theme
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  resolvedTheme: "light" | "dark"
}

function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function getResolvedTheme(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme !== "system") return theme
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const useAdminStore = create<AdminUIState>((set, get) => ({
  // Sidebar state
  sidebarCollapsed: getStoredValue("admin-sidebar-collapsed", false),
  sidebarMobileOpen: false,

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(next))
    set({ sidebarCollapsed: next })
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(collapsed))
    set({ sidebarCollapsed: collapsed })
  },

  setSidebarMobileOpen: (open: boolean) => {
    set({ sidebarMobileOpen: open })
  },

  // Theme state
  theme: getStoredValue<"light" | "dark" | "system">("admin-theme", "system"),
  resolvedTheme: getResolvedTheme(
    getStoredValue<"light" | "dark" | "system">("admin-theme", "system")
  ),

  setTheme: (theme: "light" | "dark" | "system") => {
    localStorage.setItem("admin-theme", JSON.stringify(theme))
    set({ theme, resolvedTheme: getResolvedTheme(theme) })
  },
}))
