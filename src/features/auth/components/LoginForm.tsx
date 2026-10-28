// "use client";

// import { useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
// import { useLogin } from "@/features/auth/hooks/useLogin";
// import { useSendOtp } from "@/features/auth/hooks/useRegistration";
// import { cn } from "@/lib/utils";
// import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
// import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
// import Link from "next/link";
// import { ThemeLogo } from "@/components/common/ThemeLogo";
// import { AuthThemeToggle } from "@/components/common/AuthThemeToggle";

// export function LoginForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showOtpField, setShowOtpField] = useState(false);

//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { userid: "", password: "", loginOTP: "" },
//   });

//   const login = useLogin();
//   const sendOtp = useSendOtp();

//   const handleSendOtp = () => {
//     const userid = form.getValues("userid");
//     const password = form.getValues("password");

//     if (!userid) {
//       form.setError("userid", { message: "Username is required to send OTP" });
//       return;
//     }
//     if (!password) {
//       form.setError("password", { message: "Password is required to send OTP" });
//       return;
//     }

//     sendOtp.mutate(
//       { userid, password },
//       {
//         onSuccess: (response) => {
//           if (response.statusCode === 200) setShowOtpField(true);
//         },
//       },
//     );
//   };

//   const onSubmit = form.handleSubmit((values) => {
//     if (!showOtpField) {
//       handleSendOtp();
//       return;
//     }
//     if (!values.loginOTP || values.loginOTP.length !== 6) {
//       form.setError("loginOTP", { message: "OTP must be 6 digits" });
//       return;
//     }
//     login.mutate(values);
//   });

//   // Shared input styles
//   const inputBase = cn(
//     "w-full pl-11 pr-4 py-3 text-sm rounded-lg bg-[#0d0d20]/80 border text-white placeholder-slate-500 outline-none transition-all duration-200",
//     "focus:border-[#d4a017]/70 focus:bg-[#12122b] focus:ring-2 focus:ring-[#d4a017]/20"
//   );

//   return (
//     <div className="auth-screen relative min-h-screen w-full overflow-hidden">
//       <AuthThemeToggle />
//       {/* Purple/blue glow from logo (top center) */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

//       {/* Gold ambient glow (bottom corners) */}
//       <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

//       {/* Subtle gold grid overlay */}
//       <div
//         className="absolute inset-0 opacity-[0.035] pointer-events-none"
//         style={{
//           backgroundImage:
//             "linear-gradient(rgba(245,196,81,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.4) 1px, transparent 1px)",
//           backgroundSize: "50px 50px",
//         }}
//       />

//       <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">
//         <div className="w-full max-w-md">

//           {/* ═══ Main Card ═══ */}
//           <div className="auth-card relative rounded-2xl overflow-hidden border border-[#d4a017]/20 shadow-[0_0_60px_-15px_rgba(212,160,23,0.3)] backdrop-blur-xl bg-[#0a0a1a]/70">

//             {/* Gold gradient top bar */}
//             <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#f5c451] to-transparent" />

//             {/* Corner accents */}
//             <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4a017]/40 rounded-tl-2xl pointer-events-none" />
//             <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4a017]/40 rounded-tr-2xl pointer-events-none" />
//             <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#d4a017]/40 rounded-bl-2xl pointer-events-none" />
//             <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4a017]/40 rounded-br-2xl pointer-events-none" />

//             <div className="p-6 sm:p-8 md:p-10">

//               {/* ═══ Header ═══ */}
//               <div className="flex flex-col items-center text-center mb-8">
//                 <Link href="/" className="mb-5">
//                   <ThemeLogo
//                     width={150}
//                     height={64}
//                     className="h-auto w-36 sm:w-44"
//                   />
//                 </Link>

//                 {/* "WELCOME BACK" badge — matches landing page style */}
//                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/5 mb-4">
//                   <Sparkles className="w-3 h-3 text-[#f5c451]" />
//                   <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] text-[#f5c451] uppercase">
//                     Welcome back
//                   </span>
//                 </div>

//                 {/* Display heading — Cinzel-style font */}
//                 <h1
//                   className="text-3xl sm:text-4xl font-bold tracking-wide uppercase"
//                   style={{
//                     fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
//                     background: "linear-gradient(180deg, #f5c451 0%, #d4a017 60%, #b8860b 100%)",
//                     WebkitBackgroundClip: "text",
//                     WebkitTextFillColor: "transparent",
//                     backgroundClip: "text",
//                   }}
//                 >
//                   Sign In
//                 </h1>

//                 {/* Subtitle with wide tracking */}
//                 <p className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-slate-400">
//                   Continue your journey
//                 </p>
//               </div>

//               <FormProvider {...form}>
//                 <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">

//                   {/* ═══ Credentials Section ═══ */}
//                   <div className="rounded-xl bg-[#0d0d20]/60 border border-[#d4a017]/15 p-5">
//                     <div className="flex items-center gap-2.5 mb-4">
//                       <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5c451] to-[#b8860b] flex items-center justify-center shadow-[0_0_15px_rgba(212,160,23,0.4)]">
//                         <FaLock className="text-black text-xs" />
//                       </div>
//                       <h3 className="text-xs font-semibold tracking-[0.15em] text-[#f5c451] uppercase">
//                         Account Access
//                       </h3>
//                     </div>

//                     <div className="space-y-4">
//                       {/* Username */}
//                       <div>
//                         <label className="block text-xs font-medium text-slate-300 mb-2">
//                           Username <span className="text-[#f5c451]">*</span>
//                         </label>
//                         <div className="relative">
//                           <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
//                           <input
//                             {...form.register("userid")}
//                             type="text"
//                             autoComplete="userid"
//                             placeholder="Enter your userid"
//                             className={cn(
//                               inputBase,
//                               form.formState.errors.userid
//                                 ? "border-red-500/60 bg-red-500/5"
//                                 : "border-[#d4a017]/20"
//                             )}
//                           />
//                         </div>
//                         {form.formState.errors.userid && (
//                           <p className="mt-1.5 text-xs text-red-400">
//                             {form.formState.errors.userid.message}
//                           </p>
//                         )}
//                       </div>

//                       {/* Password */}
//                       <div>
//                         <div className="flex items-center justify-between mb-2">
//                           <label className="block text-xs font-medium text-slate-300">
//                             Password <span className="text-[#f5c451]">*</span>
//                           </label>
//                           <Link
//                             href="/forgot-password"
//                             className="text-[10px] sm:text-xs text-[#f5c451] hover:text-[#ffd971] transition-colors tracking-wide"
//                           >
//                             Forgot?
//                           </Link>
//                         </div>
//                         <div className="relative">
//                           <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
//                           <input
//                             {...form.register("password")}
//                             type={showPassword ? "text" : "password"}
//                             autoComplete="current-password"
//                             placeholder="Enter your password"
//                             className={cn(
//                               inputBase,
//                               "pr-12",
//                               form.formState.errors.password
//                                 ? "border-red-500/60 bg-red-500/5"
//                                 : "border-[#d4a017]/20"
//                             )}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#f5c451] transition-colors"
//                             aria-label={showPassword ? "Hide password" : "Show password"}
//                           >
//                             {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
//                           </button>
//                         </div>
//                         {form.formState.errors.password && (
//                           <p className="mt-1.5 text-xs text-red-400">
//                             {form.formState.errors.password.message}
//                           </p>
//                         )}
//                       </div>

//                       {showOtpField && (
//                         <div>
//                           <label className="mb-2 block text-xs font-medium text-slate-300">
//                             OTP <span className="text-[#f5c451]">*</span>
//                           </label>
//                           <div className="relative">
//                             <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500" />
//                             <input
//                               {...form.register("loginOTP", {
//                                 onChange: (event) => {
//                                   form.setValue(
//                                     "loginOTP",
//                                     event.target.value.replace(/\D/g, "").slice(0, 6),
//                                   );
//                                 },
//                               })}
//                               type="text"
//                               inputMode="numeric"
//                               maxLength={6}
//                               placeholder="Enter 6-digit OTP"
//                               className={cn(
//                                 inputBase,
//                                 form.formState.errors.loginOTP
//                                   ? "border-red-500/60 bg-red-500/5"
//                                   : "border-[#d4a017]/20",
//                               )}
//                             />
//                           </div>
//                           {form.formState.errors.loginOTP && (
//                             <p className="mt-1.5 text-xs text-red-400">
//                               {form.formState.errors.loginOTP.message}
//                             </p>
//                           )}
//                         </div>
//                       )}

//                     </div>
//                   </div>

//                   {/* ═══ Submit Button ═══ */}
//                   <button
//                     type="submit"
//                     disabled={login.isPending || sendOtp.isPending}
//                     className={cn(
//                       "relative w-full py-3.5 rounded-lg font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-300 overflow-hidden group",
//                       "text-black",
//                       "disabled:opacity-60 disabled:cursor-not-allowed"
//                     )}
//                     style={{
//                       background: "linear-gradient(135deg, #f5c451 0%, #d4a017 50%, #b8860b 100%)",
//                       boxShadow: "0 0 25px rgba(212,160,23,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
//                     }}
//                   >
//                     {/* Shimmer effect */}
//                     <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

//                     <span className="relative flex items-center justify-center gap-2">
//                       {login.isPending ? (
//                         <>
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                           Signing in...
//                         </>
//                       ) : sendOtp.isPending ? (
//                         <>
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                           Sending OTP...
//                         </>
//                       ) : showOtpField ? (
//                         <>
//                           Verify & Sign In
//                           <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                         </>
//                       ) : (
//                         <>
//                           Send OTP
//                           <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
//                         </>
//                       )}
//                     </span>
//                   </button>
//                 </form>
//               </FormProvider>

//               {/* ═══ Footer ═══ */}
//               <div className="mt-6 text-center">
//                 <div className="flex items-center justify-center gap-3 mb-4">
//                   <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017]/40" />
//                   <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase">new here?</span>
//                   <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017]/40" />
//                 </div>
//                 <p className="text-sm text-slate-400">
//                   Don't have an account?{" "}
//                   <Link
//                     href="/register"
//                     className="font-semibold text-[#f5c451] hover:text-[#ffd971] transition-colors"
//                   >
//                     Create account
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Trust footer */}
//           <p className="mt-6 text-center text-[10px] tracking-[0.25em] uppercase text-slate-500 flex items-center justify-center gap-2">
//             <ShieldCheck className="w-3.5 h-3.5 text-[#d4a017]" />
//             Secure encrypted access
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { cn } from "@/lib/utils";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowRight, Check, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeLogo } from "@/components/common/ThemeLogo";
import { AuthThemeToggle } from "@/components/common/AuthThemeToggle";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [puzzleTarget, setPuzzleTarget] = useState(72);
  const [puzzlePosition, setPuzzlePosition] = useState(8);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  useEffect(() => {
    setPuzzleTarget(64 + Math.floor(Math.random() * 17));
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userid: "", password: "" },
  });

  const login = useLogin();
  const resetPuzzle = () => {
    setPuzzlePosition(8);
    setPuzzleSolved(false);
    setPuzzleTarget(64 + Math.floor(Math.random() * 17));
  };

  const onSubmit = form.handleSubmit((values) => {
    if (puzzleSolved) login.mutate(values);
  });
  const puzzleProgress = (puzzlePosition - 8) / (puzzleTarget - 8);

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

                  <section
                    className="rounded-xl border border-[#d4a017]/15 bg-[#0d0d20]/60 p-4 sm:p-5"
                    aria-label="Puzzle verification"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f5c451] sm:tracking-[0.15em]">
                        Slide to complete the puzzle
                      </h3>
                      <button
                        type="button"
                        onClick={resetPuzzle}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#25c6e8]/30 bg-[#25c6e8]/10 text-[#25c6e8] transition hover:bg-[#25c6e8]/20"
                        aria-label="Reset puzzle"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    <div
                      className="relative aspect-[2.1/1] min-h-32 overflow-hidden rounded-xl border border-violet-400/40 bg-slate-900"
                      style={{
                        backgroundImage: "url('/images/protocol-infrastructure.png')",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    >
                      <div
                        className="absolute top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-dashed border-white/80 bg-slate-900/30 shadow-[0_0_16px_rgba(37,198,232,0.2)]"
                        style={{ left: `${puzzleTarget}%` }}
                        aria-hidden="true"
                      />
                      <div
                        className={cn(
                          "absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border-2 shadow-lg transition-[left,border-color,background-color] duration-100",
                          puzzleSolved
                            ? "border-emerald-300 bg-emerald-500/80 text-white"
                            : "border-white bg-[#0b1021]/70 text-white"
                        )}
                        style={{
                          left: `${puzzlePosition}%`,
                          backgroundImage: "url('/images/protocol-infrastructure.png')",
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }}
                        aria-hidden="true"
                      >
                        {puzzleSolved && <Check className="h-6 w-6" />}
                      </div>
                    </div>

                    <div className="relative mt-3 flex h-12 items-center rounded-xl border border-violet-400/30 bg-[#14152d] px-1">
                      <div
                        className="absolute left-1 top-1 bottom-1 rounded-lg bg-gradient-to-r from-[#1680ff] via-[#25c6e8] to-[#7d75ff] transition-[width] duration-100"
                        style={{ width: `calc(${puzzleProgress * 100}% - 4px)` }}
                        aria-hidden="true"
                      />
                      <input
                        type="range"
                        min={8}
                        max={puzzleTarget}
                        step={1}
                        value={puzzlePosition}
                        onChange={(event) => {
                          const nextPosition = Number(event.target.value);
                          setPuzzlePosition(nextPosition);
                          if (nextPosition === puzzleTarget) setPuzzleSolved(true);
                        }}
                        disabled={puzzleSolved}
                        aria-label="Slide puzzle piece into the matching slot"
                        className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0 disabled:cursor-default"
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute left-1 top-1 grid h-10 w-10 place-items-center rounded-lg shadow-md transition-[left,background-color] duration-100",
                          puzzleSolved
                            ? "bg-emerald-500 text-white"
                            : "bg-[#25c6e8] text-[#0b1021]"
                        )}
                        style={{
                          left: `calc(4px + ${puzzleProgress * 100}% - ${puzzleProgress * 44}px)`,
                        }}
                        aria-hidden="true"
                      >
                        {puzzleSolved ? <Check className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                      </div>
                      <span
                        className={cn(
                          "pointer-events-none absolute inset-0 flex items-center justify-center px-12 text-center text-xs sm:text-sm",
                          puzzleSolved ? "text-emerald-300" : "text-slate-400"
                        )}
                      >
                        {puzzleSolved ? "Verification complete" : "Drag the piece to match the puzzle"}
                      </span>
                    </div>
                  </section>

                  {/* ═══ Submit Button ═══ */}
                  <button
                    type="submit"
                    disabled={login.isPending || !puzzleSolved}
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
