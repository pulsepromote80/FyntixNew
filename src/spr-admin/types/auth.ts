export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  adminUserId?: string;
  loginId?: string;
}
