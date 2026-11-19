import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center cad-bg-cream p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Image
              src="/Cadivity.png"
              alt="Cadivity"
              width={160}
              height={64}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Content */}
        <div className="cad-card bg-white p-6 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="cad-text-mono text-[var(--cad-muted)] text-center">
          &copy; {new Date().getFullYear()} Cadivity LMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
