"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/schemas/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaUser, FaEnvelope } from "react-icons/fa";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function ForgotPasswordForm() {
  const router = useRouter();
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
    "focus:border-[#d4a017]/70 focus:bg-[#12122b] focus:ring-2 focus:ring-[#d4a017]/20"
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top, #1a1038 0%, #0a0a1a 45%, #050510 100%)",
      }}
    >
      {/* Purple/blue glow from logo (top center) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Gold ambient glow (bottom corners) */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle gold grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,196,81,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">
        <div className="w-full max-w-md">

          {/* ═══ Main Card ═══ */}
          <div className="relative rounded-2xl overflow-hidden border border-[#d4a017]/20 shadow-[0_0_60px_-15px_rgba(212,160,23,0.3)] backdrop-blur-xl bg-[#0a0a1a]/70">

            {/* Gold gradient top bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#f5c451] to-transparent" />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4a017]/40 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4a017]/40 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#d4a017]/40 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4a017]/40 rounded-br-2xl pointer-events-none" />

            <div className="p-6 sm:p-8 md:p-10">

              {/* ═══ Header ═══ */}
              <div className="flex flex-col items-center text-center mb-8">
                <Link href="/" className="mb-5">
                  <Image
                    src="/logos/kalki-horizontal-logo.png"
                    alt="KALKII"
                    width={150}
                    height={64}
                    className="h-auto w-36 sm:w-44"
                  />
                </Link>

                {/* "RESET PASSWORD" badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 mb-4">
                  <Sparkles className="w-3 h-3 text-[#f5c451]" />
                  <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] text-[#f5c451] uppercase">
                    Recover Account
                  </span>
                </div>

                {/* Display heading */}
                <h1
                  className="text-3xl sm:text-4xl font-bold tracking-wide uppercase"
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
                <p className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-slate-400">
                  Reset your account access
                </p>
              </div>

              {isSubmitted ? (
                // Success state
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f5c451] to-[#b8860b] flex items-center justify-center shadow-[0_0_25px_rgba(212,160,23,0.4)]">
                    <ShieldCheck className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    We've sent a password reset link to your email address.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-300 text-black"
                    style={{
                      background: "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                      boxShadow: "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
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
                    <div className="rounded-xl bg-[#0d0d20]/60 border border-[#d4a017]/15 p-5">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5c451] to-[#b8860b] flex items-center justify-center shadow-[0_0_15px_rgba(212,160,23,0.4)]">
                          <FaUser className="text-black text-xs" />
                        </div>
                        <h3 className="text-xs font-semibold tracking-[0.15em] text-[#f5c451] uppercase">
                          Account Details
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {/* UserId */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-2">
                            User ID <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                            <input
                              {...form.register("UserId")}
                              type="text"
                              autoComplete="username"
                              placeholder="Enter your User ID"
                              className={cn(
                                inputBase,
                                form.formState.errors.UserId
                                  ? "border-red-500/60 bg-red-500/5"
                                  : "border-[#d4a017]/20"
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
                          <label className="block text-xs font-medium text-slate-300 mb-2">
                            Email Address <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                            <input
                              {...form.register("Email")}
                              type="email"
                              autoComplete="email"
                              placeholder="Enter your email"
                              className={cn(
                                inputBase,
                                form.formState.errors.Email
                                  ? "border-red-500/60 bg-red-500/5"
                                  : "border-[#d4a017]/20"
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
                        "relative w-full py-3.5 rounded-lg font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-300 overflow-hidden group",
                        "text-black",
                        "disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                      style={{
                        background: "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                        boxShadow: "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                      <span className="relative flex items-center justify-center gap-2">
                        {forgotPassword.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017]/40" />
                    <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">remembered?</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017]/40" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Back to{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#f5c451] hover:text-[#ffd971] transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trust footer */}
          <p className="mt-6 text-center text-[10px] tracking-[0.25em] uppercase text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4a017]" />
            Secure encrypted access
          </p>
        </div>
      </div>
    </div>
  );
}
