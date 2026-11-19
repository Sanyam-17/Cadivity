"use client";

import { Input } from "@/components/ui/input";
import {
  X,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register" | "forgot";

/* ─── Shared input class tokens ─── */
const INPUT_CLS =
  "bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] placeholder:text-[var(--cad-muted)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-sm text-sm";

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
    setPassword("");
    setName("");
    setPhoneNumber("");
    setShowPassword(false);
    setLoading(false);
    setError(null);
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
  }, [isOpen, switchMode]);

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
            const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            const redirect = searchParams?.get("redirect");
            if (redirect && redirect.startsWith("/")) {
              router.push(redirect);
              return;
            }
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

  const config: Record<AuthMode, { eyebrow: string; title: string; description: string }> = {
    login: {
      eyebrow: "AUTHENTICATION",
      title: "Welcome Back",
      description: "Join Cadivity and advance your technical engineering career.",
    },
    register: {
      eyebrow: "NEW ENROLLMENT",
      title: "Create Account",
      description: "Join our community and build production-grade CAD automation skills.",
    },
    forgot: {
      eyebrow: "ACCOUNT RECOVERY",
      title: "Reset Password",
      description: "Enter your email address below and we'll send you instructions to reset your password.",
    },
  };

  const { eyebrow, title, description } = config[mode];

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--cad-navy-950)]/75 backdrop-blur-sm transition-opacity"
        onClick={close}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[460px] bg-[var(--cad-cream)] text-[var(--cad-ink)] border border-[var(--cad-hairline)] rounded-sm p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Blueprint corner mark */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--cad-hairline)] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[var(--cad-hairline)] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-4 top-4 text-[var(--cad-muted)] hover:text-[var(--cad-ink)] transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── Header ── */}
        <div className="text-center space-y-2 mb-6">
          <p className="cad-eyebrow text-[var(--cad-cobalt)]">{eyebrow}</p>
          <h2 className="cad-text-h3 text-[var(--cad-ink)]">
            {title}
          </h2>
          <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            {description}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name — register only */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="cad-input-label">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          )}

          {/* Email — always visible */}
          <div className="space-y-1.5">
            <label className="cad-input-label">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--cad-muted)]">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${INPUT_CLS} pl-10`}
              />
            </div>
          </div>

          {/* Password — login & register only */}
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="cad-input-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--cad-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${INPUT_CLS} pl-10 pr-10`}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--cad-muted)] hover:text-[var(--cad-ink)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Forgot link — login only */}
              {mode === "login" && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="cad-text-mono text-xs text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Phone — register only */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="cad-input-label">
                Phone Number
              </label>
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
            <div className="cad-card bg-[var(--cad-error)]/5 px-4 py-3 text-sm text-[var(--cad-error)] border-[var(--cad-error)]/20" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              {error}
            </div>
          )}

          {/* ── CTA buttons ── */}
          {mode === "forgot" ? (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="cad-btn cad-btn-cobalt flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send Link <ArrowUpRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] flex-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="cad-btn cad-btn-cobalt w-full mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : mode === "register" ? (
                <>
                  Create Account <ArrowUpRight className="h-4 w-4 ml-1.5" />
                </>
              ) : (
                <>
                  Sign In <ArrowUpRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </button>
          )}
        </form>

        {/* ── Mode switch footer ── */}
        {mode !== "forgot" && (
          <div className="mt-6 pt-5 border-t border-[var(--cad-hairline)]">
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "register" ? "login" : "register")
                }
                className="cad-text-mono text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                {mode === "register" ? (
                  <span className="flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Sign In
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5" /> Create Account
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="cad-text-mono text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] uppercase tracking-wider transition-colors"
              >
                Forgot Password
              </button>
            </div>
          </div>
        )}

        {/* Forgot mode: back-to-login link */}
        {mode === "forgot" && (
          <div className="text-center mt-6 pt-5 border-t border-[var(--cad-hairline)]">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="cad-text-mono text-xs uppercase tracking-wider text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
