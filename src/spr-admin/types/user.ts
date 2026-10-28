export type UserRole = "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  isActive?: boolean;
}
