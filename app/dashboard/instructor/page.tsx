"use client"

import * as React from "react"
import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { StatCard } from "@/components/shared/stat-card"
import { MyCoursesPreview } from "@/components/instructor/dashboard/my-courses-preview"
import { RecentActivity } from "@/components/instructor/dashboard/recent-activity"
import { EnrollmentChart } from "@/components/instructor/dashboard/enrollment-chart"
import { PageHeader } from "@/components/shared/page-header"
import { useApi } from "@/hooks/use-api"
import { BookOpen, Users, TrendingUp, HelpCircle } from "lucide-react"

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
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's an overview of your courses."
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Courses"
            value={statsLoading ? "—" : stats?.courseCount?.toLocaleString() || "0"}
            icon={BookOpen}
            loading={statsLoading}
          />
          <StatCard
            title="Total Students"
            value={statsLoading ? "—" : stats?.studentCount?.toLocaleString() || "0"}
            icon={Users}
            iconColor="text-info"
            loading={statsLoading}
          />
          <StatCard
            title="Avg Completion"
            value={statsLoading ? "—" : `${stats?.avgCompletionRate || 0}%`}
            icon={TrendingUp}
            iconColor="text-success"
            loading={statsLoading}
          />
          <StatCard
            title="Pending Questions"
            value={statsLoading ? "—" : stats?.pendingCount?.toLocaleString() || "0"}
            icon={HelpCircle}
            iconColor="text-warning"
            loading={statsLoading}
          />
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
