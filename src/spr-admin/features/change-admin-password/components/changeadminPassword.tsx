"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Shield,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/spr-admin/components/ui/Button";
import { useCurrentUser } from "@/spr-admin/features/auth/hooks/useCurrentUser";
import {
  changeAdminPasswordSchema,
  type ChangeAdminPasswordFormValues,
} from "@/spr-admin/features/change-admin-password/schemas/changeAdminPassword.schema";
import { useChangeAdminPassword } from "@/spr-admin/features/change-admin-password/hooks/useChangeAdminPassword";

const PASSWORD_REQUIREMENTS = [
  { label: "Minimum 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one number", test: (value: string) => /[0-9]/.test(value) },
  { label: "At least one special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function ChangeAdminPassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentUser = useCurrentUser();
  const changePassword = useChangeAdminPassword();
  const loginId = currentUser.data?.loginId || currentUser.data?.email || "";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangeAdminPasswordFormValues>({
    resolver: zodResolver(changeAdminPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPassword = watch("newPassword", "");

  function onSubmit(values: ChangeAdminPasswordFormValues) {
    changePassword.mutate(values, { onSuccess: () => reset() });
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="spr-admin-change-password flex w-full items-start justify-center px-3 pb-6 pt-2 font-sans sm:px-4">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        <header className="text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Shield className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Change Admin Password</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <ShieldAlert className="h-4 w-4 text-blue-600" aria-hidden />
            Update your account password securely
          </p>
        </header>

        <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-5 py-4 sm:px-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <LockKeyhole className="h-5 w-5" aria-hidden />
              Password Settings
            </h2>
            <p className="mt-1 text-xs text-white/90">
              Enter your current password and choose a new one
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="admin-login-id"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500"
                >
                  <UserRound className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                  Username
                </label>
                <div className="relative">
                  <UserRound
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                  <input
                    id="admin-login-id"
                    value={currentUser.isPending ? "Loading..." : loginId || "Unavailable"}
                    readOnly
                    aria-label="Logged-in admin username"
                    className="spr-admin-password-username w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-600"
                  />
                </div>
                {currentUser.isError && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600">
                    Unable to load your admin account. Refresh the page and try again.
                  </p>
                )}
              </div>

              <PasswordField
                id="currentPassword"
                label="Current Password"
                placeholder="Enter current password"
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((visible) => !visible)}
                error={errors.currentPassword?.message}
                registration={register("currentPassword")}
                autoComplete="current-password"
                inputClass={inputClass}
              />

              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="Enter new password"
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((visible) => !visible)}
                error={errors.newPassword?.message}
                registration={register("newPassword")}
                autoComplete="new-password"
                inputClass={inputClass}
                icon="key"
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm New Password"
                placeholder="Confirm new password"
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((visible) => !visible)}
                error={errors.confirmPassword?.message}
                registration={register("confirmPassword")}
                autoComplete="new-password"
                inputClass={inputClass}
                icon="key"
              />
            </div>

            <div className="spr-admin-password-requirements rounded-lg border border-gray-200 bg-blue-50/60 p-4">
              <h3 className="mb-3 text-xs font-bold text-gray-700">Password Requirements</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PASSWORD_REQUIREMENTS.map((requirement) => {
                  const met = requirement.test(newPassword);
                  return (
                    <div
                      key={requirement.label}
                      className={`flex items-center gap-2 text-xs ${
                        met ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${
                          met ? "text-green-600" : "text-blue-500"
                        }`}
                        aria-hidden
                      />
                      {requirement.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={changePassword.isPending}
              disabled={currentUser.isPending || currentUser.isError || !loginId}
              className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700 focus-visible:ring-blue-500"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
              {changePassword.isPending ? "Changing Password..." : "Change Admin Password"}
            </Button>
          </form>
        </section>

        <aside className="spr-admin-password-tip flex gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
          <div className="shrink-0 rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Shield className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h3 className="mb-1.5 text-sm font-bold text-gray-800">Security Tip</h3>
            <ul className="list-inside list-disc space-y-1 text-xs text-gray-700">
              <li>Never share your password with anyone.</li>
              <li>Use a unique password that you do not use elsewhere.</li>
              <li>Change your password regularly for better security.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  id: "currentPassword" | "newPassword" | "confirmPassword";
  label: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  error?: string;
  registration: UseFormRegisterReturn;
  autoComplete: string;
  inputClass: string;
  icon?: "key";
}

function PasswordField({
  id,
  label,
  placeholder,
  visible,
  onToggle,
  error,
  registration,
  autoComplete,
  inputClass,
  icon,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500"
      >
        {icon === "key" ? (
          <KeyRound className="h-3.5 w-3.5 text-blue-600" aria-hidden />
        ) : (
          <LockKeyhole className="h-3.5 w-3.5 text-blue-600" aria-hidden />
        )}
        {label} *
      </label>
      <div className="relative">
        {icon === "key" ? (
          <KeyRound
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
        ) : (
          <LockKeyhole
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
        )}
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
          {...registration}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
