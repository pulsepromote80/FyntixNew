import { apiClient } from "@/lib/api-client";
import type {
  LoginCredentials,
  AuthenticatedUser,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RegistrationPayload,
  Country,
  ReferralData,
} from "@/types/auth";

/**
 * Browser-facing auth service. Every call goes through our own
 * `/api/auth/*` Route Handlers, never the .NET backend directly.
 */
export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthenticatedUser, LoginCredentials>(
      "/auth/login",
      credentials,
    ),

  logout: () => apiClient.post<{ success: true }>("/auth/logout"),

  me: () =>
    apiClient.get<{ success: boolean; data: AuthenticatedUser | null }>(
      "/auth/me",
    ),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<{ statusCode: number; message: string }, ForgotPasswordPayload>(
      "/Authentication/forgotPassword",
      payload,
    ),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<{ success: true }, ResetPasswordPayload>(
      "/auth/reset-password",
      payload,
    ),

  register: (payload: RegistrationPayload) =>
    apiClient.post<{ statusCode: number; message: string }, RegistrationPayload>(
      "/auth/register",
      payload,
    ),

  getCountries: () => apiClient.get<{ data: Country[] }>("/auth/countries"),

  validateReferral: (referralId: string) =>
    apiClient.get<ReferralData>(`/auth/referral?referralId=${referralId}`),

  sendOtp: (userid: string, password: string) =>
    apiClient.post<{ statusCode: number; message: string; data: null }, { userid: string, password: string }>(
      "/auth/send-otp",
      { userid, password },
    ),
};
