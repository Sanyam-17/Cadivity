








































































































































































































































































/**
 * Shared utilities and factory for dashboard UI Zustand stores.
 *
 * Both `useAdminStore` and `useInstructorStore` delegate to
 * `createDashboardUISlice` so sidebar + theme logic is defined once.
 */

import type { StateCreator } from "zustand";

// ─── Exported Types ──────────────────────────────────────────────────────────

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** The state + actions shared by every dashboard UI store. */
export interface DashboardUIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;

  // Theme
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

// ─── LocalStorage Helpers ────────────────────────────────────────────────────

/**
 * SSR-safe localStorage read.
 * Returns `fallback` on the server, when the key is absent,
 * or if JSON.parse throws.
 */
export function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

/**
 * SSR-safe localStorage write.
 * Silently no-ops on the server.
 */
export function setStoredValue(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — fail silently.
  }
}

// ─── Theme Helper ────────────────────────────────────────────────────────────

/**
 * Resolve a `ThemePreference` to an actual `"light"` or `"dark"` value.
 * When the preference is `"system"`, reads `prefers-color-scheme`.
 * Falls back to `"light"` on the server.
 */
export function getResolvedTheme(theme: ThemePreference): ResolvedTheme {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// ─── Store Factory ───────────────────────────────────────────────────────────

/**
 * Create a Zustand `StateCreator` for the shared dashboard UI slice.
 *
 * `keyPrefix` is used to namespace localStorage keys so that
 * admin and instructor preferences are stored independently
 * (e.g. `"admin-sidebar-collapsed"`, `"instructor-theme"`).
 *
 * Usage:
 * ```ts
 * export const useAdminStore = create<DashboardUIState>(
 *   createDashboardUISlice("admin"),
 * );
 * ```
 */
export function createDashboardUISlice(
  keyPrefix: string,
): StateCreator<DashboardUIState> {
  const sidebarKey = `${keyPrefix}-sidebar-collapsed`;
  const themeKey = `${keyPrefix}-theme`;

  return (set, get) => {
    const initialTheme = getStoredValue<ThemePreference>(themeKey, "system");

    return {
      // ── Sidebar ──────────────────────────────────────────────────────
      sidebarCollapsed: getStoredValue(sidebarKey, false),
      sidebarMobileOpen: false,

      toggleSidebar: () => {
        const next = !get().sidebarCollapsed;
        setStoredValue(sidebarKey, next);
        set({ sidebarCollapsed: next });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        setStoredValue(sidebarKey, collapsed);
        set({ sidebarCollapsed: collapsed });
      },

      setSidebarMobileOpen: (open: boolean) => {
        set({ sidebarMobileOpen: open });
      },

      // ── Theme ────────────────────────────────────────────────────────
      theme: initialTheme,
      resolvedTheme: getResolvedTheme(initialTheme),

      setTheme: (theme: ThemePreference) => {
        setStoredValue(themeKey, theme);
        set({ theme, resolvedTheme: getResolvedTheme(theme) });
      },
    };
  };
}
