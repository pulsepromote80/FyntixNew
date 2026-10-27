import { apiClient } from "@/lib/api-client";
import type { PaginatedData, PaginationParams } from "@/types/api";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";

export const userService = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedData<User>>("/users", { params }),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (payload: CreateUserPayload) =>
    apiClient.post<User, CreateUserPayload>("/users", payload),

  update: (id: string, payload: UpdateUserPayload) =>
    apiClient.put<User, UpdateUserPayload>(`/users/${id}`, payload),

  remove: (id: string) => apiClient.delete<{ success: true }>(`/users/${id}`),
};
