"use client";

import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationFormValues,
} from "@/features/auth/schemas/auth.schema";
import {
  useRegistration,
  useCountries,
  useValidateReferral,
} from "@/features/auth/hooks/useRegistration";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FaHashtag,
  FaUser,
  FaEnvelope,
  FaGlobe,
  FaMobileAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type RegistrationCountry = {
  Country_Id?: string | number;
  country_Id?: string | number;
  Country_Name?: string;
  country_Name?: string;
  CountryFlag?: string;
  countryFlag?: string;
  phonecode?: string;
};

export function RegistrationForm() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPositionLocked, setIsPositionLocked] = useState(false);
  const [referralName, setReferralName] = useState("");
  const [referralError, setReferralError] = useState("");

  const { data: countriesData, isLoading: countriesLoading } = useCountries();
  const registration = useRegistration();
  const validateReferral = useValidateReferral();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      referralId: "",
      countryId: "",
      countryCode: "",
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      teamPosition: undefined,
      password: "",
      termsAccepted: undefined,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setIsPositionLocked(true);
    }
  }, [mounted, searchParams, form]);

  const handleReferralValidation = async (referralId: string) => {
    setReferralError("");
    setReferralName("");
    try {
      const result = await validateReferral.mutateAsync(referralId);
      if (result.statusCode === 200) setReferralName(result.data.FullName);
      else setReferralError(result.message || "Referral ID not found");
    } catch {
      setReferralError("Invalid referral ID");
    }
  };

  const onSubmit = async (values: RegistrationFormValues) => {
    registration.mutate({
      fName: values.firstName,
      lName: values.lastName,
      password: values.password,
      email: values.email,
      countryId: values.countryId,
      mobile: values.mobile,
      address: "",
      introSide: values.teamPosition as "L" | "R",
      introAuth: values.referralId || undefined,
    });
  };

  const countries = (countriesData?.data || []) as RegistrationCountry[];
  const getCountryId = (country: RegistrationCountry) =>
    country.Country_Id ?? country.country_Id;
  const getCountryName = (country: RegistrationCountry) =>
    country.Country_Name ?? country.country_Name ?? "";
  const selectedCountry = countries.find(
    (country) => String(getCountryId(country)) === form.watch("countryId"),
  );

  useEffect(() => {
    if (!countries.length || form.getValues("countryId")) return;

    const india = countries.find(
      (country) => getCountryName(country).toLowerCase() === "india",
    );
    const indiaId = india && getCountryId(india);
    if (!india || indiaId === undefined) return;

    form.setValue("countryId", String(indiaId));
    form.setValue("countryCode", india.phonecode ? `+${india.phonecode}` : "");
  }, [countries, form]);

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
    "focus:border-[#d4a017]/70 focus:bg-[#12122b] focus:ring-2 focus:ring-[#d4a017]/20"
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a1038 0%, #0a0a1a 45%, #050510 100%)",
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,196,81,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl overflow-hidden border border-[#d4a017]/20 shadow-[0_0_60px_-15px_rgba(212,160,23,0.3)] backdrop-blur-xl bg-[#0a0a1a]/70">
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#f5c451] to-transparent" />

            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4a017]/40 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4a017]/40 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#d4a017]/40 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4a017]/40 rounded-br-2xl pointer-events-none" />

            <div className="p-6 sm:p-8 md:p-10">
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

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 mb-4">
                  <Sparkles className="w-3 h-3 text-[#f5c451]" />
                  <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] text-[#f5c451] uppercase">
                    Join the new era
                  </span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl font-bold tracking-wide uppercase"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    background:
                      "linear-gradient(180deg, #f5c451 0%, #d4a017 60%, #b8860b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Create Account
                </h1>

                <p className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-slate-400">
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
                  <div className="rounded-xl bg-gradient-to-br from-[#0d0d20]/80 to-[#0a0a1a]/80 border border-[#d4a017]/20 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5c451] to-[#b8860b] flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.5)]">
                          <FaHashtag className="text-black text-sm" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold tracking-[0.15em] text-[#f5c451] uppercase">
                            Referral & Placement
                          </h3>
                          <p className="text-[10px] text-slate-500 tracking-wide">Connect with your sponsor</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-2.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#f5c451]" />
                            Referral ID <span className="text-[#f5c451]">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#d4a017]/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm z-10" />
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
                                  : "border-[#d4a017]/30"
                              )}
                              onBlur={(e) => {
                                form.trigger("referralId");
                                if (e.target.value)
                                  handleReferralValidation(e.target.value);
                              }}
                            />
                            {validateReferral.isPending && (
                              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#f5c451] z-10" />
                            )}
                            {referralName &&
                              !referralError &&
                              !validateReferral.isPending && (
                                <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-sm z-10" />
                              )}
                            {referralError && (
                              <FaTimesCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 text-sm z-10" />
                            )}
                          </div>
                          {form.formState.errors.referralId && (
                            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                              <FaTimesCircle className="text-[10px]" />
                              {form.formState.errors.referralId.message}
                            </p>
                          )}
                          {referralError && !form.formState.errors.referralId && (
                            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                              <FaTimesCircle className="text-[10px]" />
                              {referralError}
                            </p>
                          )}
                          {referralName && !referralError && (
                            <p className="mt-1.5 text-xs font-medium text-emerald-400 flex items-center gap-1.5  px-3 py-1.5 ">
                              <FaCheckCircle className="text-[10px]" />{" "}
                              {referralName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-2.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#f5c451]" />
                            Placement Side <span className="text-[#f5c451]">*</span>
                          </label>
                          <button
                            type="button"
                            role="switch"
                            aria-label="Team placement"
                            aria-checked={form.watch("teamPosition") === "R"}
                            disabled={isPositionLocked}
                            onClick={() => {
                              const currentPosition = form.getValues("teamPosition");
                              form.setValue(
                                "teamPosition",
                                currentPosition === "L" ? "R" : "L",
                                { shouldDirty: true, shouldValidate: true },
                              );
                            }}
                            className={cn(
                              "relative flex h-14 w-full items-center rounded-full border border-[#d4a017]/30 bg-[#0d0d20]/80 p-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c451]",
                              isPositionLocked && "cursor-not-allowed opacity-50",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute left-1.5 top-1.5 h-11 w-[calc(50%-0.375rem)] rounded-full bg-gradient-to-r from-[#f5c451] to-[#d4a017] shadow-[0_0_16px_rgba(245,196,81,0.3)] transition-transform duration-300",
                                form.watch("teamPosition") === "R" && "translate-x-full",
                                !form.watch("teamPosition") && "opacity-40",
                              )}
                            />
                            <span
                              className={cn(
                                "relative z-10 flex-1 transition-colors",
                                form.watch("teamPosition") === "L" ? "text-black" : "text-slate-300",
                              )}
                            >
                              Left Team
                            </span>
                            <span
                              className={cn(
                                "relative z-10 flex-1 transition-colors",
                                form.watch("teamPosition") === "R" ? "text-black" : "text-slate-300",
                              )}
                            >
                              Right Team
                            </span>
                          </button>
                          {isPositionLocked && (
                            <p className="mt-2 text-xs text-[#f5c451] flex items-center gap-1.5 bg-[#d4a017]/10 px-3 py-1.5 rounded-lg border border-[#d4a017]/20">
                              <ShieldCheck className="w-3 h-3" /> Locked via
                              referral link
                            </p>
                          )}
                          {form.formState.errors.teamPosition && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                              <FaTimesCircle className="text-[10px]" />
                              {form.formState.errors.teamPosition.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Personal Information ─── */}
                  <div className="rounded-xl bg-[#0d0d20]/60 border border-[#d4a017]/15 p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5c451] to-[#b8860b] flex items-center justify-center shadow-[0_0_15px_rgba(212,160,23,0.4)]">
                        <FaUser className="text-black text-xs" />
                      </div>
                      <h3 className="text-xs font-semibold tracking-[0.15em] text-[#f5c451] uppercase">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          First Name <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            {...form.register("firstName")}
                            maxLength={100}
                            placeholder="John"
                            className={cn(
                              inputBase,
                              form.formState.errors.firstName
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20"
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
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Last Name <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            {...form.register("lastName")}
                            maxLength={100}
                            placeholder="Doe"
                            className={cn(
                              inputBase,
                              form.formState.errors.lastName
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20"
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
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Email Address{" "}
                          <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            {...form.register("email")}
                            maxLength={100}
                            placeholder="john@example.com"
                            className={cn(
                              inputBase,
                              form.formState.errors.email
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20"
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
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Mobile Number{" "}
                          <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          <FaMobileAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            {...form.register("mobile", {
                              onChange: (e) => {
                                const value = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                form.setValue("mobile", value);
                              },
                            })}
                            maxLength={10}
                            placeholder="0000000000"
                            className={cn(
                              inputBase,
                              form.formState.errors.mobile
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20"
                            )}
                          />
                        </div>
                        {form.formState.errors.mobile && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.mobile.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Country <span className="text-[#f5c451]">*</span>
                        </label>
                        <div className="relative">
                          {selectedCountry?.CountryFlag || selectedCountry?.countryFlag ? (
                            <img
                              src={selectedCountry.CountryFlag ?? selectedCountry.countryFlag}
                              alt={`${getCountryName(selectedCountry)} flag`}
                              className="absolute left-4 top-1/2 z-10 h-4 w-6 -translate-y-1/2 rounded-sm object-cover"
                            />
                          ) : (
                            <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm z-10" />
                          )}
                          {countriesLoading && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#F5C451]" aria-label="Loading countries" />
                          )}
                          <select
                            {...form.register("countryId")}
                            onChange={(e) => {
                              form.setValue("countryId", e.target.value, {
                                shouldValidate: true,
                              });
                              const country = countries.find(
                                (candidate) =>
                                  String(getCountryId(candidate)) === e.target.value,
                              );
                              if (country)
                                form.setValue(
                                  "countryCode",
                                  country.phonecode ? `+${country.phonecode}` : "",
                                );
                            }}
                            className={cn(
                              "w-full pl-11 pr-4 py-3 text-sm rounded-lg bg-[#0d0d20]/80 border text-white outline-none transition-all appearance-none cursor-pointer",
                              "focus:border-[#d4a017]/70 focus:bg-[#12122b] focus:ring-2 focus:ring-[#d4a017]/20",
                              "[&>option]:bg-[#0d0d20] [&>option]:text-white",
                              form.formState.errors.countryId
                                ? "border-red-500/60 bg-red-500/5"
                                : "border-[#d4a017]/20"
                            )}
                          >
                            <option value="">
                              Select Country
                            </option>
                            {countries.map((country, index) => (
                              <option
                                key={getCountryId(country) ?? index}
                                value={getCountryId(country)}
                              >
                                {getCountryName(country)}
                              </option>
                            ))}
                          </select>
                        </div>
                        {form.formState.errors.countryId && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {form.formState.errors.countryId.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Country Code
                        </label>
                        <input
                          {...form.register("countryCode")}
                          readOnly
                          placeholder="+91"
                          className="w-full px-4 py-3 text-sm rounded-lg bg-[#0d0d20]/40 border border-[#d4a017]/10 text-[#f5c451] placeholder-slate-600 outline-none cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Password <span className="text-[#f5c451]">*</span>
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                        <input
                          {...form.register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className={cn(
                            inputBase,
                            "pr-12",
                            form.formState.errors.password
                              ? "border-red-500/60 bg-red-500/5"
                              : "border-[#d4a017]/20"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#f5c451] transition-colors"
                        >
                          {showPassword ? (
                            <FaEyeSlash size={15} />
                          ) : (
                            <FaEye size={15} />
                          )}
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

                  {/* ─── Terms ─── */}
                  <div className="flex items-start gap-3 px-1">
                    <input
                      {...form.register("termsAccepted")}
                      type="checkbox"
                      id="termsAccepted"
                      className="mt-0.5 w-4 h-4 rounded border-[#d4a017]/30 bg-[#0d0d20] text-[#d4a017] focus:ring-[#d4a017]/40 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer accent-[#d4a017]"
                    />
                    <label
                      htmlFor="termsAccepted"
                      className="text-xs sm:text-sm text-slate-400 leading-relaxed"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f5c451] hover:text-[#ffd971] underline underline-offset-2 transition-colors"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f5c451] hover:text-[#ffd971] underline underline-offset-2 transition-colors"
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
                      "relative w-full py-3.5 rounded-lg font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-300 overflow-hidden group",
                      "text-black",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                    style={{
                      background:
                        "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
                      boxShadow:
                        "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                    }}
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    <span className="relative flex items-center justify-center gap-2">
                      {registration.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </FormProvider>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017]/40" />
                  <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">
                    or
                  </span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017]/40" />
                </div>
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#f5c451] hover:text-[#ffd971] transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] tracking-[0.25em] uppercase text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4a017]" />
            Your data is encrypted & secure
          </p>
        </div>
      </div>
    </div>
  );
}