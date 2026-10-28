import axios from "axios";
import { apiClient } from "@/spr-admin/lib/api-client";
import type {
  LoginCredentials,
  AuthenticatedUser,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/spr-admin/types/auth";

/**
 * Browser-facing auth service. Every call goes through our own
 * `/api/auth/*` Route Handlers, never the .NET backend directly.
 */
export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      return await apiClient.post<AuthenticatedUser, LoginCredentials>(
        "/auth/login",
        credentials,
      );
    } catch (error) {
      if (axios.isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;
        if (typeof message === "string" && message.length > 0) {
          throw new Error(message);
        }
        if (error.response?.status === 404) {
          throw new Error(
            "Admin login service was not found. Ensure /api/spr-admin/auth/login is deployed.",
          );
        }
      }
      throw error;
    }
  },

  logout: () => apiClient.post<{ success: true }>("/auth/logout"),

  me: () => apiClient.get<AuthenticatedUser>("/auth/me"),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<{ success: true }, ForgotPasswordPayload>(
      "/auth/forgot-password",
      payload,
    ),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<{ success: true }, ResetPasswordPayload>(
      "/auth/reset-password",
      payload,
    ),
};
