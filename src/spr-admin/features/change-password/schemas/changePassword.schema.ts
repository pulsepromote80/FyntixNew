import { z } from "zod";

export const changeUserPasswordSchema = z
  .object({
    loginId: z.string().trim().min(1, "Login ID is required"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangeUserPasswordFormValues = z.infer<typeof changeUserPasswordSchema>;
