"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { StatCard } from "@/components/shared/stat-card"
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed"
import { EnrollmentChart } from "@/components/admin/dashboard/enrollment-chart"
import { PageHeader } from "@/components/shared/page-header"
import { useApi } from "@/hooks/use-api"
import { Users, GraduationCap, BookOpen, UserPlus } from "lucide-react"

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
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's an overview of your LMS."
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={statsLoading ? "—" : stats?.totalStudents?.toLocaleString() || "0"}
            change={stats?.deltas.students.percentage}
            changeLabel={stats?.deltas.students.label}
            icon={Users}
            loading={statsLoading}
          />
          <StatCard
            title="Total Instructors"
            value={statsLoading ? "—" : stats?.totalInstructors?.toLocaleString() || "0"}
            change={stats?.deltas.instructors.percentage}
            changeLabel={stats?.deltas.instructors.label}
            icon={GraduationCap}
            iconColor="text-info"
            loading={statsLoading}
          />
          <StatCard
            title="Total Courses"
            value={statsLoading ? "—" : stats?.totalCourses?.toLocaleString() || "0"}
            change={stats?.deltas.courses.percentage}
            changeLabel={stats?.deltas.courses.label}
            icon={BookOpen}
            iconColor="text-success"
            loading={statsLoading}
          />
          <StatCard
            title="Total Enrollments"
            value={statsLoading ? "—" : stats?.totalEnrollments?.toLocaleString() || "0"}
            icon={UserPlus}
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
            <ActivityFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

