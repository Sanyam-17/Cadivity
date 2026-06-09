"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { useApi } from "@/hooks/use-api"
import { FileText } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AuditLogRow = {
  id: string
  adminId: string
  action: string
  targetId: string
  meta: string | null
  createdAt: string
}

type AuditLogsResponse = {
  logs: AuditLogRow[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function AuditLogsPage() {
  const { data, loading, error, refetch } = useApi<{ data: AuditLogsResponse }>({
    url: "/api/admin/audit-logs",
  })

  const logs = data?.data?.logs ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Administrative actions recorded on the platform."
        />

        {loading && (
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-8 text-sm text-muted-foreground">
            Loading audit logs…
          </div>
        )}

        {error && (
          <ErrorState title="Failed to load audit logs" description={error} onRetry={refetch} />
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
            <EmptyState
              icon={FileText}
              title="No audit entries yet"
              description="Admin actions such as role changes and course updates will appear here."
            />
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="rounded-[var(--radius-card)] border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="font-mono text-xs">{log.adminId}</TableCell>
                    <TableCell className="font-mono text-xs">{log.targetId}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {log.meta ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
