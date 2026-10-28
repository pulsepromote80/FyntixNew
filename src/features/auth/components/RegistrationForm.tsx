"use client";

import { useState, useEffect, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useRegistration, useValidateReferral } from "@/features/auth/hooks/useRegistration";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FaHashtag,
  FaUser,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeLogo } from "@/components/common/ThemeLogo";
import { AuthThemeToggle } from "@/components/common/AuthThemeToggle";

export function RegistrationForm() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralName, setReferralName] = useState("");
  const [referralError, setReferralError] = useState("");

  const registration = useRegistration();
  const validateReferral = useValidateReferral();
  const validateReferralMutation = validateReferral.mutateAsync;

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      referralId: "",
      firstName: "",
      lastName: "",
      email: "",
      teamPosition: "L",
      password: "",
      termsAccepted: undefined,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReferralValidation = useCallback(
    async (referralId: string) => {
      setReferralError("");
      setReferralName("");
      try {
        const result = await validateReferralMutation(referralId);
        if (result.statusCode === 200) setReferralName(result.data.FullName);
        else setReferralError(result.message || "Referral ID not found");
      } catch {
        setReferralError("Invalid referral ID");
      }
    },
    [validateReferralMutation],
  );

  useEffect(() => {
    if (!mounted || !searchParams) return;
    let ref = "";
    const possibleKeys = ["RefID", "Ref", "REF", "refid", "ref"];
    for (const key of possibleKeys) {
      const val = searchParams.get(key);
      if (val) {
        ref = val;
        break;
      }
    }
    if (ref.includes("~")) ref = ref.split("~")[0] || ref;
    const position = searchParams.get("Position");
    if (ref) {
      form.setValue("referralId", ref);
      handleReferralValidation(ref);
    }
    if (position === "L" || position === "R") {
      form.setValue("teamPosition", position);
    }
  }, [mounted, searchParams, form, handleReferralValidation]);

  const onSubmit = async (values: RegistrationFormValues) => {
    registration.mutate({
      fName: values.firstName,
      lName: values.lastName,
      password: values.password,
      email: values.email,
      address: "",
      introSide: values.teamPosition as "L" | "R",
      introAuth: values.referralId || undefined,
    });
  };

  const passwordValue = form.watch("password") || "";
  const passwordStrengthChecks = [
    passwordValue.length >= 8,
    /[a-z]/.test(passwordValue),
    /[A-Z]/.test(passwordValue),
    /\d/.test(passwordValue),
    /[@$!%*?&]/.test(passwordValue),
  ];
  const passwordStrength = passwordStrengthChecks.filter(Boolean).length;
  const passwordStrengthLabel =
    passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong";
  const passwordStrengthColor =
    passwordStrength <= 2
      ? "bg-red-500"
      : passwordStrength <= 3
        ? "bg-amber-400"
        : "bg-emerald-500";

  const inputBase = cn(
    "w-full pl-11 pr-4 py-3 text-sm rounded-lg bg-[#0d0d20]/80 border text-white placeholder-slate-500 outline-none transition-all duration-200",
    "focus:border-[#d4a017]/70 focus:bg-[#12122b] focus:ring-2 focus:ring-[#d4a017]/20",
  );

  return (
    <div className="auth-screen relative min-h-screen w-full overflow-hidden">
      <AuthThemeToggle />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-32 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,196,81,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="auth-card relative overflow-hidden rounded-2xl border border-[#d4a017]/20 bg-[#0a0a1a]/70 shadow-[0_0_60px_-15px_rgba(212,160,23,0.3)] backdrop-blur-xl">
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#f5c451] to-transparent" />

            <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 rounded-tl-2xl border-l-2 border-t-2 border-[#d4a017]/40" />
            <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-tr-2xl border-r-2 border-t-2 border-[#d4a017]/40" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 rounded-bl-2xl border-b-2 border-l-2 border-[#d4a017]/40" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 rounded-br-2xl border-b-2 border-r-2 border-[#d4a017]/40" />

            <div className="p-6 sm:p-8 md:p-10">
              <div className="mb-8 flex flex-col items-center text-center">
                <Link href="/" className="mb-5">
                  <ThemeLogo width={150} height={64} className="h-auto w-36 sm:w-44" />
                </Link>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 px-4 py-1.5">
                  <Sparkles className="h-3 w-3 text-[#f5c451]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#f5c451] sm:text-xs">
                    Join the new era
                  </span>
                </div>

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
                  Create Account
                </h1>

                <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-400 sm:text-xs">
                  Powering the Future of Wealth
                </p>
              </div>

              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  autoComplete="off"
                >
                  {/* ─── Referral & Placement Section ─── */}
                  <div className="relative overflow-hidden rounded-xl border border-[#d4a017]/20 bg-gradient-to-br from-[#0d0d20]/80 to-[#0a0a1a]/80 p-6">
                    <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#d4a017]/5 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl" />

                    <div className="relative z-10">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5c451] to-[#b8860b] shadow-[0_0_20px_rgba(212,160,23,0.5)]">
                          <FaHashtag className="text-sm text-black" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#f5c451]">
                            Referral & Placement
                          </h3>
                          <p className="text-[10px] tracking-wide text-slate-500">
                            Connect with your sponsor
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="mb-2.5 block flex items-center gap-1.5 text-xs font-medium text-slate-300">
                            <span className="h-1 w-1 rounded-full bg-[#f5c451]" />
                            Referral ID <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="group relative">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#d4a017]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <FaHashtag className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-500" />
                            <input
                              {...form.register("referralId")}
                              type="text"
                              maxLength={9}
                              placeholder="Enter Referral ID"
                              className={cn(
                                inputBase,
                                "relative z-10",
                                form.formState.errors.referralId
                                  ? "border-red-500/60 bg-red-500/5"
                                  : "border-[#d4a017]/30",
                              )}
                              onBlur={(e) => {
                                form.trigger("referralId");
                                if (e.target.value) handleReferralValidation(e.target.value);
                              }}
                            />
                            {validateReferral.isPending && (
                              <Loader2 className="absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 animate-spin text-[#f5c451]" />
                            )}
                            {referralName && !referralError && !validateReferral.isPending && (
                              <FaCheckCircle className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-sm text-emerald-400" />
                            )}
                            {referralError && (
                              <FaTimesCircle className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-sm text-red-400" />
                            )}
                          </div>
                          {form.formState.errors.referralId && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                              <FaTimesCircle className="text-[10px]" />
                              {form.formState.errors.referralId.message}
                            </p>
                          )}
                          {referralError && !form.formState.errors.referralId && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                              <FaTimesCircle className="text-[10px]" />
                              {referralError}
                            </p>
                          )}
                          {referralName && !referralError && (
                            <p className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400">
                              <FaCheckCircle className="text-[10px]" /> {referralName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Personal Information ─── */}
                  <div className="rounded-xl border border-[#d4a017]/15 bg-[#0d0d20]/60 p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5c451] to-[#b8860b] shadow-[0_0_15px_rgba(212,160,23,0.4)]">
                        <FaUser className="text-xs text-black" />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f5c451]">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-300">
                          First Name <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                          <input
                            {...form.register("firstName")}
                            maxLength={100}
                            placeholder="John"
                            className={cn(
                              inputBase,
                              form.formState.errors.firstName
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20",
                            )}
                          />
                        </div>
                        {form.formState.errors.firstName && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-300">
                          Last Name <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                          <input
                            {...form.register("lastName")}
                            maxLength={100}
                            placeholder="Doe"
                            className={cn(
                              inputBase,
                              form.formState.errors.lastName
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20",
                            )}
                          />
                        </div>
                        {form.formState.errors.lastName && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-300">
                          Email Address <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                          <input
                            {...form.register("email")}
                            maxLength={100}
                            placeholder="john@example.com"
                            className={cn(
                              inputBase,
                              form.formState.errors.email
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20",
                            )}
                          />
                        </div>
                        {form.formState.errors.email && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-300">
                          Password <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
                          <input
                            {...form.register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
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
                          >
                            {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                          </button>
                        </div>
                        {passwordValue && (
                          <div className="mt-2" aria-live="polite">
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                              <span className="text-slate-400">Password strength</span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  passwordStrength <= 2
                                    ? "text-red-400"
                                    : passwordStrength <= 3
                                      ? "text-amber-300"
                                      : "text-emerald-400",
                                )}
                              >
                                {passwordStrengthLabel}
                              </span>
                            </div>
                            <div
                              className="flex gap-1"
                              role="progressbar"
                              aria-label={`Password strength: ${passwordStrengthLabel}`}
                              aria-valuemin={0}
                              aria-valuemax={5}
                              aria-valuenow={passwordStrength}
                            >
                              {passwordStrengthChecks.map((_, index) => (
                                <span
                                  key={index}
                                  className={cn(
                                    "h-1.5 flex-1 rounded-full bg-slate-700/70",
                                    index < passwordStrength && passwordStrengthColor,
                                  )}
                                />
                              ))}
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-500">
                              Use 8+ characters with uppercase, lowercase, a number, and a symbol.
                            </p>
                          </div>
                        )}
                        {form.formState.errors.password && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── Terms ─── */}
                  <div className="flex items-start gap-3 px-1">
                    <input
                      {...form.register("termsAccepted")}
                      type="checkbox"
                      id="termsAccepted"
                      className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[#d4a017]/30 bg-[#0d0d20] text-[#d4a017] accent-[#d4a017] focus:ring-[#d4a017]/40 focus:ring-offset-0 focus:ring-offset-transparent"
                    />
                    <label
                      htmlFor="termsAccepted"
                      className="text-xs leading-relaxed text-slate-400 sm:text-sm"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25c6e8] underline underline-offset-2 transition-colors hover:text-[#7d75ff]"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25c6e8] underline underline-offset-2 transition-colors hover:text-[#7d75ff]"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {form.formState.errors.termsAccepted && (
                    <p className="text-xs text-red-400">
                      {form.formState.errors.termsAccepted.message}
                    </p>
                  )}

                  {/* ─── Submit ─── */}
                  <button
                    type="submit"
                    disabled={registration.isPending}
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
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">
                      {registration.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </FormProvider>

              <div className="mt-6 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017]/40" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">or</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017]/40" />
                </div>
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#f5c451] transition-colors hover:text-[#ffd971]"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.25em] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-[#d4a017]" />
            Your data is encrypted & secure
          </p>
        </div>
      </div>
    </div>
  );
}
