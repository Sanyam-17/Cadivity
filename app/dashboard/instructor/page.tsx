"use client"

import * as React from "react"
import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { StatCard } from "@/components/shared/stat-card"
import { MyCoursesPreview } from "@/components/instructor/dashboard/my-courses-preview"
import { RecentActivity } from "@/components/instructor/dashboard/recent-activity"
import { EnrollmentChart } from "@/components/instructor/dashboard/enrollment-chart"
import { DashboardHero } from "@/components/shared/dashboard-hero"
import { StateView } from "@/components/shared/state/state-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApi } from "@/hooks/use-api"
import { ArrowUpRight, BookOpen, Users, TrendingUp, HelpCircle } from "lucide-react"

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
    error: statsError,
    refetch: refetchStats,
  } = useApi<InstructorStats>({ url: "/api/instructor/dashboard/stats" })

  return (
    <InstructorLayout>
      <div className="space-y-6 pb-8">
        <DashboardHero
          eyebrow="Instructor workspace"
          title="Plan the next learning win."
          description="Keep an eye on your course performance, learner momentum, and conversations without changing any of the live data behind your classroom."
          actions={
            <Button asChild className="bg-[#F2A63B] text-[#070B14] hover:bg-[#e0952e] rounded-[2px] font-mono text-[11px] font-bold uppercase tracking-[0.12em] shadow-sm">
              <Link href="/dashboard/instructor/courses">Manage my courses <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Assigned courses" value={stats?.courseCount} loading={statsLoading} />
            <HeroMetric label="Learners reached" value={stats?.studentCount} loading={statsLoading} />
            <HeroMetric label="Completion rate" value={stats?.avgCompletionRate} suffix="%" loading={statsLoading} />
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
              title="My Courses"
              value={statsLoading ? "—" : stats?.courseCount?.toLocaleString() || "0"}
              icon={BookOpen}
              loading={statsLoading}
            />
            <StatCard
              title="Total Students"
              value={statsLoading ? "—" : stats?.studentCount?.toLocaleString() || "0"}
              icon={Users}
              iconColor="text-primary"
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
        </StateView>

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

function HeroMetric({ label, value, suffix = "", loading }: { label: string; value?: number; suffix?: string; loading: boolean }) {
  return (
    <div className="rounded-[2px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xs">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#4AB8EA]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">{loading ? "--" : `${value?.toLocaleString() || "0"}${suffix}`}</p>
    </div>
  )
}
