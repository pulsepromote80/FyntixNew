"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/spr-admin/features/auth/schemas/auth.schema";
import { useLogin } from "@/spr-admin/features/auth/hooks/useLogin";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318] text-white shadow-2xl shadow-blue-950/30"
      >
        <div className="border-b border-white/10 bg-[#111318] px-6 py-7 text-center">
          <div className="flex items-center justify-center">
            <Image
              src="/logos/fyntix-logo-dark.png"
              alt="Fyntix"
              width={250}
              height={80}
              className="admin-login-logo-dark h-auto w-56 max-w-full object-contain"
              priority
            />
            <Image
              src="/logos/fyntix-logo-light.png"
              alt="Fyntix"
              width={250}
              height={80}
              className="admin-login-logo-light hidden h-auto w-56 max-w-full object-contain"
              priority
            />
          </div>
          <p className="mt-3 text-xs font-medium tracking-[0.24em] text-slate-400">
            ADMIN CONTROL PANEL
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                {...form.register("username")}
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full rounded-lg border border-white/10 bg-[#191c23] py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#1680ff] focus:outline-none focus:ring-2 focus:ring-[#1680ff]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/10 bg-[#191c23] py-3 pl-10 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-[#1680ff] focus:outline-none focus:ring-2 focus:ring-[#1680ff]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#25c6e8]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1680ff] py-3 font-semibold text-[#0b0d12] shadow-lg shadow-[#1680ff]/20 transition hover:bg-[#25c6e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {login.isPending ? (
              "Signing in..."
            ) : (
              <>
                Sign in to Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {login.isError && (
            <p className="text-center text-sm text-red-600" role="alert">
              {login.error instanceof Error
                ? login.error.message
                : "Unable to sign in. Please check your username and password."}
            </p>
          )}

          <p className="text-center text-xs text-slate-500">
            Secure access to your Fyntix dashboard
          </p>
        </div>

        <div className="border-t border-white/10 bg-[#0e1015] px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="font-semibold tracking-wide text-slate-300">
              FYNTIX ADMIN
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure login area</span>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
