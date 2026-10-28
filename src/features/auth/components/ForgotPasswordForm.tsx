"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { cn } from "@/lib/utils";
import { FaUser, FaEnvelope } from "react-icons/fa";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ThemeLogo } from "@/components/common/ThemeLogo";
import { AuthThemeToggle } from "@/components/common/AuthThemeToggle";

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { UserId: "", Email: "" },
  });

  const forgotPassword = useForgotPassword();

  const onSubmit = form.handleSubmit((values) => {
    forgotPassword.mutate(values, {
      onSuccess: () => setIsSubmitted(true),
    });
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

                {/* "RESET PASSWORD" badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 px-4 py-1.5">
                  <Sparkles className="h-3 w-3 text-[#f5c451]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#f5c451] sm:text-xs">
                    Recover Account
                  </span>
                </div>

                {/* Display heading */}
                <h1
                  className="text-3xl font-bold uppercase sm:text-4xl"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    background: "linear-gradient(180deg, #f5c451 0%, #d4a017 60%, #b8860b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Forgot Password
                </h1>

                {/* Subtitle */}
                <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-400 sm:text-xs">
                  Reset your account access
                </p>
              </div>

              {isSubmitted ? (
                // Success state
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f5c451] to-[#b8860b] shadow-[0_0_25px_rgba(212,160,23,0.4)]">
                    <ShieldCheck className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">Check Your Email</h3>
                  <p className="mb-6 text-sm text-slate-400">
                    We&apos;ve sent a password reset link to your email address.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                      boxShadow:
                        "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              ) : (
                // Form state
                <FormProvider {...form}>
                  <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
                    {/* ═══ Account Details Section ═══ */}
                    <div className="rounded-xl border border-[#d4a017]/15 bg-[#0d0d20]/60 p-5">
                      <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5c451] to-[#b8860b] shadow-[0_0_15px_rgba(212,160,23,0.4)]">
                          <FaUser className="text-xs text-black" />
                        </div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f5c451]">
                          Account Details
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {/* UserId */}
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-300">
                            User ID <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                            <input
                              {...form.register("UserId")}
                              type="text"
                              autoComplete="username"
                              placeholder="Enter your User ID"
                              className={cn(
                                inputBase,
                                form.formState.errors.UserId
                                  ? "border-red-500/60 bg-red-500/5"
                                  : "border-[#d4a017]/20",
                              )}
                            />
                          </div>
                          {form.formState.errors.UserId && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {form.formState.errors.UserId.message}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-300">
                            Email Address <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                            <input
                              {...form.register("Email")}
                              type="email"
                              autoComplete="email"
                              placeholder="Enter your email"
                              className={cn(
                                inputBase,
                                form.formState.errors.Email
                                  ? "border-red-500/60 bg-red-500/5"
                                  : "border-[#d4a017]/20",
                              )}
                            />
                          </div>
                          {form.formState.errors.Email && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {form.formState.errors.Email.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ═══ Submit Button ═══ */}
                    <button
                      type="submit"
                      disabled={forgotPassword.isPending}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-lg py-3.5 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-300",
                        "text-black",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      )}
                      style={{
                        background:
                          "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                        boxShadow:
                          "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                      <span className="relative flex items-center justify-center gap-2">
                        {forgotPassword.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                </FormProvider>
              )}

              {/* ═══ Footer ═══ */}
              {!isSubmitted && (
                <div className="mt-6 text-center">
                  <div className="mb-4 flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017]/40" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      remembered?
                    </span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017]/40" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Back to{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#f5c451] transition-colors hover:text-[#ffd971]"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              )}
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
