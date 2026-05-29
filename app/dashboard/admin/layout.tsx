import type { Metadata, Viewport } from 'next'
import { requireRole } from '@/lib/server/auth-guard'
import "@/app/styles/admin.css"

export const metadata: Metadata = {
  title: 'Cadivity Admin Dashboard',
  description: 'LMS Admin Dashboard for Cadivity - CAD Automation & Training',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side guard — redirects non-admin users
  await requireRole("admin");

  return <>{children}</>;
}

