"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { FaLock, FaKey, FaPaperPlane } from "react-icons/fa";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPass: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    otp: z.string().min(1, "OTP is required"),
  })
  .refine((data) => data.newPass === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const methods = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPass: "",
      confirmPassword: "",
      otp: "",
    },
  });

  const { formState: { isSubmitting } } = methods;
  const { setValue } = methods;

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      const response = await fetch("/api/auth/send-otp-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setOtpSent(true);
        toast.success(result.message || "OTP sent to your email");
      } else {
        toast.error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (data: ChangePasswordValues) => {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPass: data.newPass,
          otp: data.otp,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password changed successfully");
        setOtpSent(false);
        setValue("otp", "");
        setValue("oldPassword", "");
        setValue("newPass", "");
        setValue("confirmPassword", "");
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-6"
      >
        {/* Current Password */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FaLock className="w-4 h-4 text-amber-500" />
            Current Password <span className="text-red-500">*</span>
          </label>
          <FormInput
            name="oldPassword"
            type="password"
            placeholder="Enter your current password"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FaKey className="w-4 h-4 text-emerald-400" />
            New Password <span className="text-red-500">*</span>
          </label>
          <FormInput
            name="newPass"
            type="password"
            placeholder="Enter your new password (min 8 characters)"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FaKey className="w-4 h-4 text-emerald-400" />
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <FormInput
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
          />
        </div>

        {/* OTP Section */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FaPaperPlane className="w-4 h-4 text-amber-500" />
            Enter OTP <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <FormInput
                name="otp"
                type="text"
                placeholder="Enter OTP sent to your email"
              />
            </div>
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || otpSent}
              isLoading={sendingOtp}
              className="h-10 w-full rounded-lg bg-amber-400 px-4 font-semibold text-gray-900 shadow-md transition-all duration-200 hover:bg-amber-500 focus-visible:ring-amber-400 sm:w-auto"
            >
              {otpSent ? "OTP Sent" : "Send OTP"}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !otpSent}
          isLoading={isSubmitting}
          className="w-full bg-amber-400 text-gray-900 hover:bg-amber-500 focus-visible:ring-amber-400"
        >
          Change Password
        </Button>
      </form>
    </FormProvider>
  );
}
