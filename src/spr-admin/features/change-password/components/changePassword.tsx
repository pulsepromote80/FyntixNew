"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";
import {
  changeUserPasswordSchema,
  type ChangeUserPasswordFormValues,
} from "@/spr-admin/features/change-password/schemas/changePassword.schema";
import { useChangeUserPassword } from "@/spr-admin/features/change-password/hooks/useChangeUserPassword";

export default function ChangeUserPassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const changePassword = useChangeUserPassword();
  const form = useForm<ChangeUserPasswordFormValues>({
    resolver: zodResolver(changeUserPasswordSchema),
    defaultValues: {
      loginId: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;
  const newPassword = watch("newPassword");

  function onSubmit(values: ChangeUserPasswordFormValues) {
    changePassword.mutate(values, {
      onSuccess: () => reset(),
    });
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]";

  return (
    <div className="w-full font-sans">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37] text-gray-900 shadow-sm">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Change User Password</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <ShieldAlert className="h-4 w-4 text-[#D4AF37]" />
            Update a user&apos;s password securely
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#D4AF37] px-5 py-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <Lock className="h-4 w-4" />
              Password Settings
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-800">
              Enter the user&apos;s current password and choose a new password
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {changePassword.isError && (
                <div
                  className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {changePassword.error instanceof Error
                    ? changePassword.error.message
                    : "Failed to change user password."}
                </div>
              )}

              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="loginId"
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase text-gray-500"
                  >
                    <User className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Login ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      id="loginId"
                      autoComplete="username"
                      placeholder="Enter login ID"
                      aria-invalid={Boolean(errors.loginId)}
                      aria-describedby={errors.loginId ? "loginId-error" : undefined}
                      className={`${inputClass} ${errors.loginId ? "border-red-500" : ""}`}
                      {...register("loginId")}
                    />
                  </div>
                  {errors.loginId && (
                    <p id="loginId-error" className="mt-1 text-xs text-red-600">
                      {errors.loginId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase text-gray-500"
                  >
                    <Lock className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Current Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      aria-invalid={Boolean(errors.currentPassword)}
                      aria-describedby={
                        errors.currentPassword ? "currentPassword-error" : undefined
                      }
                      className={`${inputClass} ${errors.currentPassword ? "border-red-500" : ""}`}
                      {...register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((visible) => !visible)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p id="currentPassword-error" className="mt-1 text-xs text-red-600">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase text-gray-500"
                  >
                    <Key className="h-3.5 w-3.5 text-[#D4AF37]" />
                    New Password *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      aria-invalid={Boolean(errors.newPassword)}
                      aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                      className={`${inputClass} ${errors.newPassword ? "border-red-500" : ""}`}
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((visible) => !visible)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      aria-label={
                        showNewPassword ? "Hide new password" : "Show new password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p id="newPassword-error" className="mt-1 text-xs text-red-600">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase text-gray-500"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword ? "confirmPassword-error" : undefined
                      }
                      className={`${inputClass} ${errors.confirmPassword ? "border-red-500" : ""}`}
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <h3 className="mb-2 text-xs font-bold text-gray-700">
                  Password Requirement
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 shrink-0 ${newPassword?.length >= 8 ? "text-green-600" : "text-[#D4AF37]"}`}
                  />
                  At least 8 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={changePassword.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#D4AF37] py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-[#B89328] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changePassword.isPending ? (
                  "Changing password..."
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Change User Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="flex w-full items-start gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#FFF9E6] p-4">
          <div className="shrink-0 rounded-full bg-[#D4AF37]/20 p-1.5">
            <Shield className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="mb-1 text-xs font-bold text-gray-800">Security Tip</h3>
            <ul className="space-y-0.5 text-[11px] text-gray-600">
              <li>Never share passwords in messages or email</li>
              <li>Use a unique password that is not used elsewhere</li>
              <li>Confirm the login ID before submitting the change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
