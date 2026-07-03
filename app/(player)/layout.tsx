import type { Metadata, Viewport } from 'next'
import { requireAuth } from '@/lib/server/auth-guard'
import "@/app/styles/student.css"

export const metadata: Metadata = {
  title: 'Course Console - Cadivity',
  description: 'Track your progress and learn directly inside the Cadivity LMS console.',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default async function PlayerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side guard — any authenticated user can access the player
  await requireAuth();

  return (
    <div className="theme-student h-screen w-screen overflow-hidden bg-slate-950">
      {children}
    </div>
  );
}
