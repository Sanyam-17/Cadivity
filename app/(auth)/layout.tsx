import { ReactNode } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Cadivity</span>
          </Link>
        </div>

        {/* Content */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 sm:p-8 shadow-sm animate-in fade-in zoom-in-95 duration-300">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Cadivity LMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
