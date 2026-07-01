"use client"

import * as React from "react"
import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { StatCard } from "@/components/shared/stat-card"
import { KPITile } from "@/components/shared/kpi-tile"
import { ModeBadge } from "@/components/shared/mode-badge"
import { MyCoursesPreview } from "@/components/instructor/dashboard/my-courses-preview"
import { RecentActivity } from "@/components/instructor/dashboard/recent-activity"
import { EnrollmentChart } from "@/components/instructor/dashboard/enrollment-chart"
import { PageHeader } from "@/components/shared/page-header"
import { useApi } from "@/hooks/use-api"
import { BookOpen, Users, TrendingUp, HelpCircle, Award } from "lucide-react"

interface InstructorStats {
  courseCount: number
  studentCount: number
  avgCompletionRate: number
  pendingCount: number
}

export default function InstructorDashboardPage() {
  const {
    data: stats,
    loading: statsLoading,
  } = useApi<InstructorStats>({ url: "/api/instructor/dashboard/stats" })

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Dashboard"
            description="Welcome back! Here's an overview of your courses."
          />
          <ModeBadge mode="instructor" variant="solid" />
        </div>

        {/* KPI Tiles Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="instructor-kpi-card">
            <KPITile
              title="My Courses"
              value={statsLoading ? 0 : stats?.courseCount || 0}
              icon={BookOpen}
              accentColor="amber"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
          <div className="instructor-kpi-card">
            <KPITile
              title="Total Students"
              value={statsLoading ? 0 : stats?.studentCount || 0}
              icon={Users}
              accentColor="amber"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
          <div className="instructor-kpi-card">
            <KPITile
              title="Avg Completion"
              value={statsLoading ? 0 : stats?.avgCompletionRate || 0}
              suffix="%"
              icon={TrendingUp}
              accentColor="amber"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
          <div className="instructor-kpi-card">
            <KPITile
              title="Pending Questions"
              value={statsLoading ? 0 : stats?.pendingCount || 0}
              icon={HelpCircle}
              accentColor="amber"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
        </div>

        {/* Enrollment Trend + Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <EnrollmentChart />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* My Courses Preview */}
        <MyCoursesPreview />
      </div>
    </InstructorLayout>
  )
}
