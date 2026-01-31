"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Heart,
  Activity,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === "signin") {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || "Failed to sign in");
          return;
        }

        toast.success("Successfully signed in!");
        router.push("/dashboard");
      } else {
        // Sign up with email and password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          toast.error(error.message || "Failed to create account");
          return;
        }

        toast.success("Account created successfully! Please check your email.");
        // Optional: Redirect to a verification page or stay here
        // router.push("/auth/verify");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
          throw error;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden">
      {/* Left Panel: Authentication Form */}
      <div className="flex w-full flex-col justify-center bg-white px-4 py-8 sm:px-12 md:w-1/2 lg:w-[45%] xl:w-[40%] overflow-y-auto">
        <div className="mx-auto w-full max-w-110 animate-fade-in-up">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2 text-brand-primary">
              <Heart className="h-9 w-9 fill-current" />
              <span className="text-xl font-bold tracking-tight text-neutral-text-primary">
                Vitality
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-text-primary">
              Welcome back
            </h1>
            <p className="text-sm font-normal text-neutral-text-secondary">
              Please enter your credentials to access the secure portal.
            </p>
          </div>

          {/* Segmented Control (Toggle) */}
          <div className="mb-8 rounded-lg bg-neutral-bg-main p-1 shadow-inner">
            <div className="flex h-10 w-full items-center">
              {/* Sign In Tab */}
              <label
                className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-all duration-300 ${authMode === "signin"
                    ? "bg-white text-neutral-text-primary shadow-sm"
                    : "text-neutral-text-secondary hover:text-neutral-text-primary"
                  }`}
              >
                <span>Sign In</span>
                <input
                  type="radio"
                  name="auth_mode"
                  value="signin"
                  checked={authMode === "signin"}
                  onChange={() => setAuthMode("signin")}
                  className="hidden"
                />
              </label>

              {/* Create Account Tab */}
              <label
                className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-all duration-300 ${authMode === "register"
                    ? "bg-white text-neutral-text-primary shadow-sm"
                    : "text-neutral-text-secondary hover:text-neutral-text-primary"
                  }`}
              >
                <span>Create Account</span>
                <input
                  type="radio"
                  name="auth_mode"
                  value="register"
                  checked={authMode === "register"}
                  onChange={() => setAuthMode("register")}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border-2 border-neutral-border bg-white px-6 text-base font-semibold text-neutral-text-primary shadow-sm transition-all duration-200 hover:bg-neutral-bg-main hover:border-neutral-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-text-secondary">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Sign In/Up Form */}
          <form
            onSubmit={handleEmailPasswordAuth}
            className="flex flex-col gap-5"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none text-neutral-text-primary"
              >
                Professional Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="h-12 w-full rounded-lg border border-neutral-border bg-white px-4 text-base text-neutral-text-primary placeholder:text-neutral-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none text-neutral-text-primary"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="h-12 w-full rounded-lg border border-neutral-border bg-white px-4 pr-12 text-base text-neutral-text-primary placeholder:text-neutral-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 flex h-full w-12 items-center justify-center text-neutral-text-secondary hover:text-neutral-text-primary transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading || isGoogleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password (only for sign in) */}
            {authMode === "signin" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading || isGoogleLoading}
                    className="h-4 w-4 rounded border-neutral-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-neutral-text-primary group-hover:text-brand-primary transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-brand-primary hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {authMode === "signin"
                    ? "Signing In..."
                    : "Creating Account..."}
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  {authMode === "signin" ? "Secure Sign In" : "Create Account"}
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="mt-2 text-center">
              <p className="text-xs text-neutral-text-secondary">
                By accessing this system, you agree to the{" "}
                <Link
                  href="#"
                  className="underline hover:text-brand-primary transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="underline hover:text-brand-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-neutral-border bg-neutral-bg-main py-3 text-neutral-text-secondary">
            <Shield className="h-4.5 w-4.5" />
            <span className="text-xs font-medium">
              256-bit SSL Secure Connection
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Brand & Info */}
      <div className="relative hidden w-0 flex-1 flex-col justify-between overflow-hidden bg-slate-900 md:flex lg:w-[55%] xl:w-[60%]">
        {/* Background Image/Gradient with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-0 bg-linear-to-br from-slate-900 via-slate-800 to-brand-primary opacity-90" />

        {/* Abstract decorative elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 h-64 w-full bg-linear-to-t from-slate-900 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 flex h-full flex-col p-12 lg:p-16 animate-fade-in">
          {/* Logo Area */}
          <div className="flex items-center gap-3 text-white/90">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-medium tracking-wide">
              Vitality Platform
            </span>
          </div>

          {/* Main Content Centered */}
          <div className="mt-auto mb-auto max-w-lg">
            <h2 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
              Intelligent
              <br />
              <span className="text-sky-400 animate-gradient">
                City-Scale Triage
              </span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-white/80">
              Orchestrating emergency response with precision and speed. The
              unified portal for city administrators and hospital operators.
            </p>

            {/* Benefits List */}
            <div className="flex flex-col gap-6">
              {/* Item 1 */}
              <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-400 group-hover:bg-white/20 transition-colors">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Real-time Coordination
                  </h3>
                  <p className="text-sm text-white/60">
                    Seamless data flow between EMS and hospital intake units.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-400 group-hover:bg-white/20 transition-colors">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Explainable AI
                  </h3>
                  <p className="text-sm text-white/60">
                    Transparent algorithmic decision support for triage
                    prioritization.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-400 group-hover:bg-white/20 transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Secure Data Handling
                  </h3>
                  <p className="text-sm text-white/60">
                    HIPAA-compliant architecture with end-to-end encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer/Status */}
          <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Operational</span>
            </div>
            <span>v2.4.0 (Stable)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
