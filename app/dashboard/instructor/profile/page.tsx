"use client"

import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { PageHeader } from "@/components/shared/page-header"
import { ProfileForm } from "@/components/instructor/profile/profile-form"
import { ChangePasswordForm } from "@/components/instructor/profile/change-password-form"

export default function InstructorProfilePage() {
  return (
    <InstructorLayout>
      <div className="space-y-6 max-w-2xl">
        <PageHeader
          title="Profile"
          description="Manage your personal information and password"
        />
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </InstructorLayout>
  )
}
