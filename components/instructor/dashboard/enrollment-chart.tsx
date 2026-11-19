// Using recharts (already installed in package.json as v2.15.4)
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
  count: number
}

interface CourseSummary {
  id: string
  title: string
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
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")

  const trendParams = React.useMemo(
    () => ({
      days,
      ...(selectedCourse ? { courseId: selectedCourse } : {}),
    }),
    [days, selectedCourse]
  )

  const { data: trendData, loading, error, refetch } = useApi<{ data: TrendData[] }>({
    url: "/api/instructor/dashboard/enrollment-trend",
    params: trendParams,
  })

  const { data: courses } = useApi<CourseSummary[]>({
    url: "/api/instructor/courses",
    params: { limit: 100, select: "id,title" },
  })

  const chartData = (trendData?.data || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  const hasData = chartData.some((d) => d.count > 0)

  return (
    <div className="rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 p-6">
        <div>
          <h3 className="font-display text-base font-bold text-[#0E1624]">Enrollment Trend</h3>
          <p className="font-mono text-[11px] text-[#5B6B7F] mt-0.5">
            Daily enrollments in your courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Course filter */}
          {courses && courses.length > 0 && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="h-8 rounded-[2px] border border-[var(--cad-hairline,rgba(14,22,36,0.15))] bg-muted/40 px-2 font-mono text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#4AB8EA]"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
          {/* Days toggle */}
          <div className="flex items-center rounded-[2px] border border-border/60 bg-muted/40 p-0.5">
            <button
              onClick={() => setDays(7)}
              className={cn(
                "rounded-[2px] px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer",
                days === 7
                  ? "bg-card text-[#0E1624] shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              7 days
            </button>
            <button
              onClick={() => setDays(30)}
              className={cn(
                "rounded-[2px] px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer",
                days === 30
                  ? "bg-card text-[#0E1624] shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              30 days
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="h-[260px] rounded-lg skeleton-shimmer" />
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : !hasData ? (
          <EmptyState
            icon={BarChart3}
            title="No enrollment data"
            description="Enrollments will appear here once students start enrolling in your courses."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              />
              <Bar
                dataKey="count"
                fill="hsl(175, 70%, 40%)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
