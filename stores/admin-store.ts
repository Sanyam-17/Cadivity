"use client"

import { create } from "zustand"
import { createDashboardUISlice, type DashboardUIState } from "@/lib/store-utils"

// Extend the base interface if admin-specific state is needed in the future.
// For now the admin store uses the shared shape as-is.
type AdminUIState = DashboardUIState

export const useAdminStore = create<AdminUIState>(
  createDashboardUISlice("admin"),
)
