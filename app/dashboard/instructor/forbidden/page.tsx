"use client"

import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { Button } from "@/components/ui/button"
import { ShieldX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function InstructorForbiddenPage() {
  return (
    <InstructorLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          You do not have permission to access this resource. This course may belong to
          another instructor.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/dashboard/instructor">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </InstructorLayout>
  )
}
