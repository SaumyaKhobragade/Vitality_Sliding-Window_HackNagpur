"use client";

import { useState } from "react";
import { LoginHeader } from "@/app/Components/login/LoginHeader";
import { AuthToggle } from "@/app/Components/login/AuthToggle";
import { LoginForm } from "@/app/Components/login/LoginForm";
import { SecureBadge } from "@/app/Components/login/SecureBadge";
import { BrandingPanel } from "@/app/Components/login/BrandingPanel";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-background">
      {/* Left Panel: Authentication Form */}
      <div className="flex w-full flex-col justify-center bg-background px-4 py-8 sm:px-12 md:w-1/2 lg:w-[45%] xl:w-[40%] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="mx-auto w-full max-w-110">
          <LoginHeader />
          <AuthToggle mode={mode} setMode={setMode} />

          {/* 
            In a real app, we would condition this. 
            For this conversion, we show the Login Form as primary.
            If mode === 'register', we could show a RegisterForm component.
           */}
          <LoginForm />

          <SecureBadge />
        </div>
      </div>

      {/* Right Panel: Brand & Info */}
      <BrandingPanel />
    </div>
  );
}
