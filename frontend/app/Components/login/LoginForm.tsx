"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await authClient.signIn.email({
                email,
                password,
                rememberMe,
            });

            if (result.error) {
                toast.error(result.error.message || "Failed to sign in");
                return;
            }

            toast.success("Signed in successfully!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
            });
        } catch (error) {
            toast.error("Failed to sign in with Google");
            console.error("Google sign in error:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Google Sign In Button */}
            <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-background px-6 text-base font-semibold hover:bg-muted"
            >
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
            </Button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                    </span>
                </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-5">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="email"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        Professional Email
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@hospital.org"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="h-12 w-full rounded-lg border-border bg-background px-4 text-base placeholder:text-muted-foreground focus-visible:ring-primary"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="password"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        Password
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="h-12 w-full rounded-lg border-border bg-background px-4 pr-12 text-base placeholder:text-muted-foreground focus-visible:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 flex h-full w-12 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked === true)}
                            className="data-[state=checked]:bg-primary border-muted-foreground/30"
                        />
                        <span className="text-sm text-foreground select-none">
                            Remember me
                        </span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:text-primary/80 hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>

                {/* Submit Button */}
                <Button
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    type="submit"
                    disabled={isLoading}
                >
                    <Lock className="h-5 w-5" />
                    {isLoading ? "Signing in..." : "Secure Sign In"}
                </Button>

                {/* Help Text */}
                <div className="mt-2 text-center">
                    <p className="text-xs text-muted-foreground">
                        By accessing this system, you agree to the{" "}
                        <Link href="/terms" className="underline hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </form>
        </div>
    );
}
