"use client"

import * as React from "react"
import { authClient } from "@/lib/client/auth-client"
import { Button } from "@/components/ui/button"
import { Loader2, MailCheck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("No verification token provided.")
      return
    }

    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token },
        })

        if (error) {
          setStatus("error")
          setErrorMessage(error.message || "Failed to verify email. The link might be expired.")
        } else {
          setStatus("success")
        }
      } catch (err) {
        setStatus("error")
        setErrorMessage("An unexpected error occurred")
      }
    }

    verify()
  }, [token])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your email...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Verification Failed</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {errorMessage}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Return to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <MailCheck className="h-6 w-6 text-success" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Email Verified!</h1>
        <p className="text-sm text-muted-foreground">
          Your email address has been successfully verified. You can now access all features.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/login">Continue to login</Link>
      </Button>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  )
}
