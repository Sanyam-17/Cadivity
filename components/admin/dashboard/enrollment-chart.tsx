"use client"

import * as React from "react"
import { useApi } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface TrendData {
  date: string
  label: string
  enrollments: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          Enrollments:{" "}
          <span className="font-medium text-foreground">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function EnrollmentChart() {
  const [days, setDays] = React.useState(7)
  const params = React.useMemo(() => ({ days }), [days])

  const { data, loading, error, refetch } = useApi<TrendData[]>({
    url: "/api/admin/dashboard/enrollment-trend",
    params,
  })

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h3 className="text-subheading">Enrollment Trend</h3>
          <p className="text-caption text-muted-foreground mt-0.5">
            Daily enrollments over time
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-border bg-secondary p-0.5">
          <button
            onClick={() => setDays(7)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              days === 7
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            7 days
          </button>
          <button
            onClick={() => setDays(30)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              days === 30
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            30 days
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="h-[260px] rounded-lg skeleton-shimmer" />
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : !data || data.length === 0 || data.every((d) => d.enrollments === 0) ? (
          <EmptyState
            icon={BarChart3}
            title="No enrollment data"
            description="Enrollments will appear here once students start enrolling in courses."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar
                dataKey="enrollments"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

