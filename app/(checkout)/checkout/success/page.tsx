"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { CheckCircle2, Loader2, KeyRound } from "lucide-react"
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
    <div className="min-h-screen bg-slate-955 text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Payment Successful!
          </h1>
          <p className="text-slate-400 text-sm">
            {course ? (
              <>You&apos;re enrolled in <span className="text-white font-medium">{course.title}</span>.</>
            ) : (
              "Your enrollment is confirmed."
            )}
          </p>
        </div>

        {isNewAccount && email ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4 backdrop-blur text-left">
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <KeyRound className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p>
                We&apos;ve created your Cadivity account using <span className="text-white">{email}</span>.
                Enter the 6-digit sign-in code we just emailed you to access your course.
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full bg-primary text-white rounded-xl"
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Start Learning"}
            </Button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="w-full text-center text-xs text-slate-500 hover:text-primary transition-colors"
            >
              {isResending ? "Resending..." : "Didn't get a code? Resend"}
            </button>
          </div>
        ) : (
          <Button asChild className="w-full bg-primary text-white rounded-xl py-6">
            <Link href={playUrl}>Start Learning</Link>
          </Button>
        )}

        <Link href="/courses" className="block text-xs text-slate-500 hover:text-primary transition-colors">
          Browse more courses
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-955 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </React.Suspense>
  )
}