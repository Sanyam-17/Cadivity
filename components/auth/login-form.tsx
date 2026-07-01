"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useState, useTransition, useEffect } from "react";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register" | "otp" | "forgot";
type UserRole = "student" | "instructor";

export function LoginForm() {
  const router = useRouter();

  const { isOpen, close } = useAuthModal();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleEmailPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authClient.signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: (ctx) => {
            toast.success("Signed in successfully!");
            close();
            const user = ctx.data.user;
            if (user.role === "admin") {
              router.push("/dashboard/admin");
            } else if (user.role === "instructor") {
              router.push("/dashboard/instructor");
            } else {
              router.push("/dashboard/student");
            }
          },
          onError: (ctx: any) => {
            setError(ctx.error.message || "Invalid email or password");
          },
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account created! Please check your email to verify.");
            setMode("login");
          },
          onError: (ctx: any) => {
            setError(ctx.error.message || "Registration failed");
          },
        },
      } as any);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // better-auth forgetPassword — uses the emailOtp plugin
      await (authClient as any).forgetPassword({
        email,
        redirectTo: "/reset-password",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Password reset email sent!");
            setMode("login");
          },
          onError: (ctx: any) => {
            setError(ctx.error.message || "Failed to send reset email");
          },
        },
      });
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={close}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md relative animate-in fade-in zoom-in-95 shadow-2xl border border-white/10 bg-gradient-to-br from-white/95 to-white/90 dark:from-neutral-950 dark:to-neutral-900 corner-bracket">
          {/* Decorative corner brackets */}
          <div className="absolute -inset-px pointer-events-none">
            <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-primary/20 rounded-tl"></div>
            <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-primary/20 rounded-tr"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-primary/20 rounded-bl"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-primary/20 rounded-br"></div>
          </div>

          {/* Close */}
          <button
            onClick={close}
            className="absolute right-5 top-5 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <CardHeader className="space-y-3 pb-4">
            {/* Blueprint grid background */}
            <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none rounded-lg"></div>

            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                {mode === "register"
                  ? "Create Your Account"
                  : mode === "forgot"
                    ? "Reset Password"
                    : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {mode === "register"
                  ? "Join Cadivity and start your learning journey today"
                  : mode === "forgot"
                    ? "Enter your email to receive a password reset link"
                    : mode === "login" ? "Sign in to access your courses and dashboard" : ""}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Email Login / Register / Forgot */}
            <form
              onSubmit={(e) => {
                if (mode === "register") handleRegister(e);
                else if (mode === "forgot") handleForgotPassword(e);
                else handleEmailPasswordLogin(e);
              }}
              className="space-y-4"
            >
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground technical-label">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-neutral-800/50 border border-white/20 dark:border-neutral-700/50 focus:border-primary/50 focus:bg-white dark:focus:bg-neutral-800 rounded-lg transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground technical-label">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-neutral-800/50 border border-white/20 dark:border-neutral-700/50 focus:border-primary/50 focus:bg-white dark:focus:bg-neutral-800 rounded-lg transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground technical-label">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-neutral-800/50 border border-white/20 dark:border-neutral-700/50 focus:border-primary/50 focus:bg-white dark:focus:bg-neutral-800 rounded-lg transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground technical-label">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-neutral-800/50 border border-white/20 dark:border-neutral-700/50 focus:border-primary/50 focus:bg-white dark:focus:bg-neutral-800 rounded-lg transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in">
                  <p className="text-xs font-medium text-destructive">{error}</p>
                </div>
              )}

              {mode === "forgot" ? (
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 rounded-lg transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode("login")}
                    className="flex-1 border border-white/20 dark:border-neutral-700/50 hover:bg-white/5 dark:hover:bg-neutral-800/50 font-medium rounded-lg transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : mode === "register" ? (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </form>

            {/* Toggle Mode */}
            {mode !== "forgot" && (
              <div className="pt-2 space-y-3 border-t border-white/10 dark:border-neutral-800/50">
                <p className="text-xs text-muted-foreground text-center">
                  {mode === "register" ? "Already have an account?" : "Don't have an account yet?"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "register" ? "login" : "register");
                    setError(null);
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {mode === "register" ? "Sign in with your account" : "Create a new account"}
                </button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-white/10 dark:bg-neutral-800/50"></div>
                  <span>or</span>
                  <div className="flex-1 h-px bg-white/10 dark:bg-neutral-800/50"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Need to reset your password?
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

