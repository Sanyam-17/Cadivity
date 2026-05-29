import type { Metadata, Viewport } from 'next'
import { requireRole } from '@/lib/server/auth-guard'
import "@/app/styles/student.css"

export const metadata: Metadata = {
  title: 'Student Dashboard - Cadivity',
  description: 'Access your enrolled courses and track your progress on Cadivity LMS.',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side guard — redirects non-student users
  await requireRole("student");

  return <>{children}</>;
}
