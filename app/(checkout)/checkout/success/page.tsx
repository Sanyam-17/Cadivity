"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { CheckCircle2, Loader2, KeyRound, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"

interface CourseSummary {
  title: string
  slug: string
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const courseSlug = searchParams.get("course")
  const isNewAccount = searchParams.get("newAccount") === "1"
  const email = searchParams.get("email")

  const [course, setCourse] = React.useState<CourseSummary | null>(null)
  const [otp, setOtp] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)

  React.useEffect(() => {
    if (!courseSlug) return
    fetch(`/api/courses/${courseSlug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setCourse({ title: json.data.title, slug: json.data.slug })
        }
      })
      .catch(() => {})
  }, [courseSlug])

  const playUrl = courseSlug ? `/courses/${courseSlug}/play` : "/dashboard/student"

  const handleVerifyOtp = async () => {
    if (!email || otp.length !== 6) return
    setIsVerifying(true)
    try {
      const { error } = await authClient.signIn.emailOtp({ email, otp })
      if (error) {
        toast.error(error.message || "That code didn't work. Please try again.")
        return
      }
      router.push(playUrl)
    } catch {
      toast.error("Something went wrong verifying your code.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) return
    setIsResending(true)
    try {
      await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" })
      toast.success("A new sign-in code has been sent to your email.")
    } catch {
      toast.error("Couldn't resend the code. Please try again shortly.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cad-cream)] text-[var(--cad-ink)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[var(--cad-cream)] border border-[var(--cad-hairline)] rounded-sm p-8 text-center space-y-6 relative">
        {/* Blueprint corner marks */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[var(--cad-hairline)] pointer-events-none" />

        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-[var(--cad-cobalt)] flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-[var(--cad-cobalt)]" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="cad-eyebrow text-[var(--cad-cobalt)]">ENROLLMENT CONFIRMED</p>
          <h1 className="cad-text-h3 text-[var(--cad-ink)]">
            Enrollment confirmed
          </h1>
          <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            {course ? (
              <>You are enrolled in <span className="text-[var(--cad-ink)] font-semibold">{course.title}</span>.</>
            ) : (
              "Your enrollment and course access have been confirmed."
            )}
          </p>
        </div>

        {isNewAccount && email ? (
          <div className="rounded-sm border border-[var(--cad-hairline)] bg-[var(--cad-ice)]/30 p-5 space-y-4 text-left">
            <div className="flex items-start gap-2.5 text-xs text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              <KeyRound className="h-4 w-4 text-[var(--cad-cobalt)] shrink-0 mt-0.5" />
              <p>
                We&apos;ve set up your Cadivity account for <span className="font-semibold text-[var(--cad-ink)]">{email}</span>.
                Enter the 6-digit access code sent to your email to begin.
              </p>
            </div>

            <div className="flex justify-center py-1">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-1.5">
                  <InputOTPSlot index={0} className="border-[var(--cad-hairline)] rounded-sm bg-transparent" />
                  <InputOTPSlot index={1} className="border-[var(--cad-hairline)] rounded-sm bg-transparent" />
                  <InputOTPSlot index={2} className="border-[var(--cad-hairline)] rounded-sm bg-transparent" />
                  <InputOTPSlot index={3} className="border-[var(--cad-hairline)] rounded-sm bg-transparent" />
                  <InputOTPSlot index={4} className="border-[var(--cad-hairline)] rounded-sm bg-transparent" />
                  <InputOTPSlot index={5} className="border-[var(--cad-hairline)] rounded-sm bg-transparent" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifying}
              className="cad-btn cad-btn-cobalt w-full flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Start Learning</span>
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="cad-text-mono text-xs uppercase tracking-wider text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] transition-colors w-full text-center block pt-1"
            >
              {isResending ? "Resending..." : "Didn't receive code? Resend"}
            </button>
          </div>
        ) : (
          <Link
            href={playUrl}
            className="cad-btn cad-btn-cobalt w-full py-3.5 inline-flex items-center justify-center gap-2"
          >
            <span>Start Learning</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}

        <div className="pt-2">
          <Link
            href="/courses"
            className="cad-text-mono text-xs uppercase tracking-wider text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] transition-colors inline-block"
          >
            Browse more courses
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--cad-cream)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-[var(--cad-cobalt)] animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </React.Suspense>
  )
}