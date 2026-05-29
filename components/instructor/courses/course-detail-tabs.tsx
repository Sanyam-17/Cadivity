"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "./overview-tab"
import { SettingsTab } from "./settings-tab"
import { CurriculumTab } from "./curriculum-tab"
import { StudentsTab } from "./students-tab"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CourseDetailTabsProps {
  courseId: string
  courseTitle: string
}

export function CourseDetailTabs({ courseId, courseTitle }: CourseDetailTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get("tab") || "overview"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
            <Link href="/dashboard/instructor/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title={courseTitle} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 rounded-none h-auto">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 text-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 text-sm font-medium"
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 text-sm font-medium"
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 text-sm font-medium"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab courseId={courseId} />
          </TabsContent>

          <TabsContent value="curriculum" className="mt-6">
            <CurriculumTab courseId={courseId} />
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <StudentsTab courseId={courseId} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab courseId={courseId} />
          </TabsContent>
        </Tabs>
      </div>
    </InstructorLayout>
  )
}
