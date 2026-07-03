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
import {
  X,
  Loader2,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useState, useEffect, useCallback } from "react";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register" | "forgot";

/* ─── Shared input class tokens ─── */
const INPUT_CLS =
  "bg-[#f8fafc] border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#0c2357] focus-visible:border-[#0c2357] h-11";

export function LoginForm() {
  const router = useRouter();
  const { isOpen, close } = useAuthModal();

  /* ── Shared state (persists across mode switches) ── */
  const [email, setEmail] = useState("");

  /* ── Mode-specific state (cleared on switch) ── */
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Mode switcher: preserves email, clears everything else ── */
  const switchMode = useCallback((next: AuthMode) => {
    setMode(next);
    // Clear mode-specific UI state
    setPassword("");
    setName("");
    setPhoneNumber("");
    setShowPassword(false);
    setLoading(false);
    setError(null);
    // email is intentionally NOT cleared
  }, []);

  /* ── Lock body scroll while modal is open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── Reset to login when modal reopens ── */
  useEffect(() => {
    if (isOpen) {
      switchMode("login");
      setEmail("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  /* ═══════════════════════════════════════════
     Handlers
     ═══════════════════════════════════════════ */

  async function handleLogin(e: React.FormEvent) {
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
            if (user.role === "admin") router.push("/dashboard/admin");
            else if (user.role === "instructor") router.push("/dashboard/instructor");
            else router.push("/dashboard/student");
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
            switchMode("login");
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
      const { error: resetError } = await (authClient as any).forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email");
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        switchMode("login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    if (mode === "register") handleRegister(e);
    else if (mode === "forgot") handleForgotPassword(e);
    else handleLogin(e);
  }

  /* ═══════════════════════════════════════════
     Per-mode content config
     ═══════════════════════════════════════════ */

  const headings: Record<AuthMode, { title: string; description: string }> = {
    login: {
      title: "Welcome Back to Cadivity!",
      description: "Join Cadivity and advance your technical career.",
    },
    register: {
      title: "SIGN UP TO CADIVITY!",
      description: "Join our community and create your account to get started on Cadivity.",
    },
    forgot: {
      title: "GET A BRAND NEW PASSWORD!",
      description: "Enter your email address below and we'll send you instructions to reset your password.",
    },
  };

  const { title, description } = headings[mode];

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0c2357]/40 backdrop-blur-sm transition-opacity"
        onClick={close}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-[420px] bg-white text-slate-900 border-0 shadow-2xl rounded-2xl relative animate-in fade-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={close}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* ── Header ── */}
          <CardHeader className="text-center space-y-3 pt-8 pb-4">
            <CardTitle className="text-[28px] font-bold text-[#0c2357] leading-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 px-6">
              {description}
            </CardDescription>
          </CardHeader>

          {/* ── Form ── */}
          <CardContent className="space-y-6 px-6 pb-8">
            <form onSubmit={onSubmit} className="space-y-4">

              {/* Name — register only */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1a2b4b]">
                    What&apos;s your name?
                  </Label>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              )}

              {/* Email — always visible */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1a2b4b]">
                  What&apos;s your e-mail?
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    placeholder="E-mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${INPUT_CLS} pl-10`}
                  />
                </div>
              </div>

              {/* Password — login & register only */}
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1a2b4b]">
                    Your password?
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${INPUT_CLS} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Forgot link — login only, right below password */}
                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Phone — register only */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1a2b4b]">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="98xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              )}

              {/* Error alert */}
              {error && (
                <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2.5 rounded-lg">
                  {error}
                </p>
              )}

              {/* ── CTA buttons ── */}
              {mode === "forgot" ? (
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#0c2357] hover:bg-[#091a42] text-white h-11 text-base shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        OK <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => switchMode("login")}
                    className="flex-1 border-slate-200 bg-[#f8fafc] text-slate-600 hover:bg-slate-100 h-11 text-base shadow-sm"
                  >
                    cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0c2357] hover:bg-[#091a42] text-white h-12 text-base font-medium shadow-md mt-2 transition-all hover:-translate-y-0.5"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : mode === "register" ? (
                    <span className="flex items-center gap-2">
                      Create Account{" "}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Login <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              )}
            </form>

            {/* ── Mode switch footer ── */}
            {mode !== "forgot" && (
              <div className="mt-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
                    <span className="bg-white px-3 text-slate-400">
                      Account Options
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() =>
                      switchMode(mode === "register" ? "login" : "register")
                    }
                    className="text-[#3b82f6] hover:text-[#2563eb] font-medium text-sm flex items-center gap-1.5 transition-colors"
                  >
                    {mode === "register" ? (
                      <span className="flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" /> Sign In
                      </span>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </button>

                  {/* Show forgot-password shortcut on register too */}
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-[#3b82f6] hover:text-[#2563eb] font-medium text-sm transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            {/* Forgot mode: back-to-login link */}
            {mode === "forgot" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[#3b82f6] hover:text-[#2563eb] font-medium text-sm flex items-center gap-1 mx-auto transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
