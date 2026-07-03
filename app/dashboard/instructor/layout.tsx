import type { Metadata, Viewport } from 'next'
import { requireInstructorOrAdmin } from '@/lib/server/auth-guard'
import "@/app/styles/instructor.css"

export const metadata: Metadata = {
  title: 'Instructor Dashboard - Cadivity',
  description: 'Manage your courses, students, and teaching content on Cadivity LMS.',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default async function InstructorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side guard — redirects non-instructor users
  await requireInstructorOrAdmin();

  return <div className="theme-instructor min-h-screen">{children}</div>;
}

