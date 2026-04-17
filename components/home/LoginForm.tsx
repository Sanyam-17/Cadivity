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
import { X, Loader2 } from "lucide-react";
import { useAuthModal } from "../auth/useAuthModal";
import { useState, useTransition } from "react";

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
              router.push("/admin");
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-neutral-900 text-white border-neutral-800 relative animate-in fade-in zoom-in-95">
          {/* Close */}
          <button
            onClick={close}
            className="absolute right-4 top-4 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              {mode === "register" 
                ? "SIGN UP TO CADIVITY!" 
                : mode === "forgot"
                ? "GET A BRAND NEW PASSWORD!"
                : "LOGIN OR SIGN UP TO START LEARNING"}
            </CardTitle>
            
          </CardHeader>

          <CardContent className="space-y-6">
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
                  <Label htmlFor="name" className="text-neutral-300 font-bold">
                    What&apos;s your name?
                  </Label>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300 font-bold">
                  What&apos;s your e-mail?
                </Label>
                <Input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-300 font-bold">
                    Your password?
                  </Label>
                  <Input
                    type="password"
                    placeholder="Password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-neutral-300 font-bold">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="98xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {mode === "forgot" ? (
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : "OK"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode("login")}
                    className="flex-1 border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 font-bold"
                  >
                    cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-6"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : mode === "register" ? (
                    "Start your learning journey"
                  ) : (
                    "Login"
                  )}
                </Button>
              )}
            </form>

            {/* Toggle Mode */}
            {mode !== "forgot" && (
              <div className="flex items-center justify-between text-xs px-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "register" ? "login" : "register");
                    setError(null);
                  }}
                  className="text-[#6366f1] hover:underline font-medium"
                >
                  {mode === "register" ? "Sign in with your account" : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); }}
                  className="text-[#6366f1] hover:underline font-medium"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
