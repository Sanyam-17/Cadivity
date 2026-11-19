"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { StatCard } from "@/components/shared/stat-card"
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed"
import { EnrollmentChart } from "@/components/admin/dashboard/enrollment-chart"
import { DashboardHero } from "@/components/shared/dashboard-hero"
import { StateView } from "@/components/shared/state/state-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApi } from "@/hooks/use-api"
import { ArrowUpRight, Users, GraduationCap, BookOpen, UserPlus } from "lucide-react"

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
      <div className="space-y-6 pb-8">
        <DashboardHero
          eyebrow="Admin workspace"
          title="Run your learning business with clarity."
          description="A focused command center for your people, catalogue, and enrolments?built around the data already powering your LMS."
          actions={
            <>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 rounded-[2px] font-mono text-[11px] uppercase tracking-[0.12em]">
                <Link href="/dashboard/admin/instructors">Manage instructors</Link>
              </Button>
              <Button asChild className="bg-[#F2A63B] text-[#070B14] hover:bg-[#e0952e] rounded-[2px] font-mono text-[11px] font-bold uppercase tracking-[0.12em] shadow-sm">
                <Link href="/dashboard/admin/courses">Open course library <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Learners" value={stats?.totalStudents} loading={statsLoading} />
            <HeroMetric label="Instructors" value={stats?.totalInstructors} loading={statsLoading} />
            <HeroMetric label="Courses" value={stats?.totalCourses} loading={statsLoading} />
          </div>
        </DashboardHero>

        {/* Stats Grid with StateView */}
        <StateView
          state={
            statsLoading && !stats
              ? { status: "loading", skeleton: "stat", count: 4 }
              : statsError && !stats
              ? { status: "error", error: statsError, onRetry: refetchStats }
              : { status: "success" }
          }
        >
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
              iconColor="text-primary"
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
              iconColor="text-success"
              loading={statsLoading}
            />
          </div>
        </StateView>

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

function HeroMetric({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="rounded-[2px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xs">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#4AB8EA]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">{loading ? "--" : value?.toLocaleString() || "0"}</p>
    </div>
  )
}
