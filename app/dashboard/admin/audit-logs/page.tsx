"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { FileText } from "lucide-react"

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Audit Logs"
          description="View administrative actions and system events."
        />

        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
          <EmptyState
            icon={FileText}
            title="Audit Logs Coming Soon"
            description="This feature is currently under development. Soon you'll be able to track all administrative actions and system events here."
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

