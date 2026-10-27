import { z } from "zod";

export const loginSchema = z.object({
  userid: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  loginOTP: z.string().optional(),
  rememberMe: z.boolean().refine((val) => val === true, {
    message: "Please check 'Keep me signed in' to continue",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  UserId: z.string().min(1, "Username is required"),
  Email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const registrationSchema = z.object({
  referralId: z.string().min(3, "Referral ID must be at least 3 characters"),
  countryId: z.string().min(1, "Country is required"),
  countryCode: z.string().min(1, "Country code is required"),
  firstName: z
    .string()
    .min(3, "First name must be at least 3 characters")
    .regex(
      /^(?!.*(.)\1{2}).*$/,
      "First name cannot have 3 or more repeated characters"
    ),
  lastName: z
    .string()
    .min(3, "Last name must be at least 3 characters")
    .regex(
      /^(?!.*(.)\1{2}).*$/,
      "Last name cannot have 3 or more repeated characters"
    ),
  mobile: z
    .string()
    .min(7, "Mobile number must be at least 7 digits")
    .max(10, "Mobile number must be at most 10 digits")
    .regex(/^[0-9]{7,10}$/, "Mobile number must be 7 to 10 digits")
    .refine(
      (val) =>
        !["123456", "123456789", "123123", "password", "qwerty"].includes(val),
      "This mobile number is too common and insecure"
    ),
  email: z.string().email("Invalid email address"),
  teamPosition: z
    .string()
    .optional()
    .refine((val) => val === "L" || val === "R", {
      message: "Please select a placement side",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .refine(
      (val) =>
        !["123456", "12345678", "123123", "password", "qwerty"].includes(val),
      "This password is too common and insecure"
    ),
  termsAccepted: z
    .boolean()
    .optional()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;