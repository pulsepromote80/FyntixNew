"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useSendOtp } from "@/features/auth/hooks/useRegistration";
import { cn } from "@/lib/utils";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeLogo } from "@/components/common/ThemeLogo";
import { AuthThemeToggle } from "@/components/common/AuthThemeToggle";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userid: "", password: "", loginOTP: "" },
  });

  const login = useLogin();
  const sendOtp = useSendOtp();

  const handleSendOtp = () => {
    const userid = form.getValues("userid");
    const password = form.getValues("password");

    if (!userid) {
      form.setError("userid", { message: "Username is required to send OTP" });
      return;
    }
    if (!password) {
      form.setError("password", { message: "Password is required to send OTP" });
      return;
    }

    sendOtp.mutate(
      { userid, password },
      {
        onSuccess: (response) => {
          if (response.statusCode === 200) setShowOtpField(true);
        },
      },
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!showOtpField) {
      handleSendOtp();
      return;
    }
    if (!values.loginOTP || values.loginOTP.length !== 6) {
      form.setError("loginOTP", { message: "OTP must be 6 digits" });
      return;
    }
    login.mutate(values);
  });

  // Shared input styles
  const inputBase = cn(
    "w-full pl-11 pr-4 py-3 text-sm rounded-lg bg-[#0d0d20]/80 border text-white placeholder-slate-500 outline-none transition-all duration-200",
    "focus:border-[#d4a017]/70 focus:bg-[#12122b] focus:ring-2 focus:ring-[#d4a017]/20",
  );

  return (
    <div className="auth-screen relative min-h-screen w-full overflow-hidden">
      <AuthThemeToggle />
      {/* Purple/blue glow from logo (top center) */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-32 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

      {/* Gold ambient glow (bottom corners) */}
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px]" />

      {/* Subtle gold grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,196,81,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* ═══ Main Card ═══ */}
          <div className="auth-card relative overflow-hidden rounded-2xl border border-[#d4a017]/20 bg-[#0a0a1a]/70 shadow-[0_0_60px_-15px_rgba(212,160,23,0.3)] backdrop-blur-xl">
            {/* Gold gradient top bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#f5c451] to-transparent" />

            {/* Corner accents */}
            <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2 border-[#d4a017]/40" />
            <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-tr-2xl border-r-2 border-t-2 border-[#d4a017]/40" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 rounded-bl-2xl border-b-2 border-l-2 border-[#d4a017]/40" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 rounded-br-2xl border-b-2 border-r-2 border-[#d4a017]/40" />

            <div className="p-6 sm:p-8 md:p-10">
              {/* ═══ Header ═══ */}
              <div className="mb-8 flex flex-col items-center text-center">
                <Link href="/" className="mb-5">
                  <ThemeLogo width={150} height={64} className="h-auto w-36 sm:w-44" />
                </Link>

                {/* "WELCOME BACK" badge — matches landing page style */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 px-4 py-1.5">
                  <Sparkles className="h-3 w-3 text-[#f5c451]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#f5c451] sm:text-xs">
                    Welcome back
                  </span>
                </div>

                {/* Display heading — Cinzel-style font */}
                <h1
                  className="text-3xl font-bold uppercase tracking-wide sm:text-4xl"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    background: "linear-gradient(180deg, #f5c451 0%, #d4a017 60%, #b8860b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Sign In
                </h1>

                {/* Subtitle with wide tracking */}
                <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-400 sm:text-xs">
                  Continue your journey
                </p>
              </div>

              <FormProvider {...form}>
                <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
                  {/* ═══ Credentials Section ═══ */}
                  <div className="rounded-xl border border-[#d4a017]/15 bg-[#0d0d20]/60 p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5c451] to-[#b8860b] shadow-[0_0_15px_rgba(212,160,23,0.4)]">
                        <FaLock className="text-xs text-black" />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f5c451]">
                        Account Access
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Username */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-300">
                          Username <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                          <input
                            {...form.register("userid")}
                            type="text"
                            autoComplete="userid"
                            placeholder="Enter your userid"
                            className={cn(
                              inputBase,
                              form.formState.errors.userid
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20",
                            )}
                          />
                        </div>
                        {form.formState.errors.userid && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.userid.message}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="block text-xs font-medium text-slate-300">
                            Password <span className="text-[#f5c451]">*</span>
                          </label>
                          <Link
                            href="/forgot-password"
                            className="text-[10px] tracking-wide text-[#f5c451] transition-colors hover:text-[#ffd971] sm:text-xs"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <div className="relative">
                          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                          <input
                            {...form.register("password")}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            className={cn(
                              inputBase,
                              "pr-12",
                              form.formState.errors.password
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-[#f5c451]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                          </button>
                        </div>
                        {form.formState.errors.password && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      {showOtpField && (
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-300">
                            OTP <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="relative">
                            <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                            <input
                              {...form.register("loginOTP", {
                                onChange: (event) => {
                                  form.setValue(
                                    "loginOTP",
                                    event.target.value.replace(/\D/g, "").slice(0, 6),
                                  );
                                },
                              })}
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              className={cn(
                                inputBase,
                                form.formState.errors.loginOTP
                                  ? "border-red-500/60 bg-red-500/5"
                                  : "border-[#d4a017]/20",
                              )}
                            />
                          </div>
                          {form.formState.errors.loginOTP && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {form.formState.errors.loginOTP.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ═══ Submit Button ═══ */}
                  <button
                    type="submit"
                    disabled={login.isPending || sendOtp.isPending}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-lg py-3.5 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-300",
                      "text-black",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                    style={{
                      background: "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                      boxShadow:
                        "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                    }}
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">
                      {login.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : sendOtp.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : showOtpField ? (
                        <>
                          Verify & Sign In
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </FormProvider>

              {/* ═══ Footer ═══ */}
              <div className="mt-6 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017]/40" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    new here?
                  </span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017]/40" />
                </div>
                <p className="text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-[#f5c451] transition-colors hover:text-[#ffd971]"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Trust footer */}
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.25em] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-[#d4a017]" />
            Secure encrypted access
          </p>
        </div>
      </div>
    </div>
  );
}
