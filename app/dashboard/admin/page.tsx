"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { StatCard } from "@/components/shared/stat-card"
import { KPITile } from "@/components/shared/kpi-tile"
import { ModeBadge } from "@/components/shared/mode-badge"
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed"
import { EnrollmentChart } from "@/components/admin/dashboard/enrollment-chart"
import { PageHeader } from "@/components/shared/page-header"
import { useApi } from "@/hooks/use-api"
import { Users, GraduationCap, BookOpen, UserPlus, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalStudents: number
  totalInstructors: number
  totalCourses: number
  totalEnrollments: number
  deltas: {
    students: { value: number; percentage: number; label: string }
    instructors: { value: number; percentage: number; label: string }
    courses: { value: number; percentage: number; label: string }
  }
}

export default function DashboardPage() {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi<DashboardStats>({ url: "/api/admin/dashboard/stats" })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Dashboard"
            description="Welcome back! Here's an overview of your LMS."
          />
          <ModeBadge mode="admin" variant="solid" />
        </div>

        {/* KPI Tiles Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="admin-kpi-card">
            <KPITile
              title="Total Students"
              value={statsLoading ? 0 : stats?.totalStudents || 0}
              change={stats?.deltas.students.percentage}
              changeLabel={stats?.deltas.students.label}
              icon={Users}
              accentColor="red"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
          <div className="admin-kpi-card">
            <KPITile
              title="Total Instructors"
              value={statsLoading ? 0 : stats?.totalInstructors || 0}
              change={stats?.deltas.instructors.percentage}
              changeLabel={stats?.deltas.instructors.label}
              icon={GraduationCap}
              accentColor="red"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
          <div className="admin-kpi-card">
            <KPITile
              title="Total Courses"
              value={statsLoading ? 0 : stats?.totalCourses || 0}
              change={stats?.deltas.courses.percentage}
              changeLabel={stats?.deltas.courses.label}
              icon={BookOpen}
              accentColor="red"
              cornerBracket
              animated
              loading={statsLoading}
            />
          </div>
          <div className="admin-kpi-card">
            <KPITile
              title="Total Enrollments"
              value={statsLoading ? 0 : stats?.totalEnrollments || 0}
              icon={UserPlus}
              accentColor="red"
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
            <ActivityFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

