"use client"

import { create } from "zustand"
import { createDashboardUISlice, type DashboardUIState } from "@/lib/store-utils"

// Extend the base interface if instructor-specific state is needed in the future.
// For now the instructor store uses the shared shape as-is.
type InstructorUIState = DashboardUIState

export const useInstructorStore = create<InstructorUIState>(
  createDashboardUISlice("instructor"),
)
