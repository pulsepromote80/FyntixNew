import type { AxiosRequestConfig } from "axios";
import { httpClient } from "@/lib/axios";

/**
 * Thin, typed wrapper around the Axios instance used by feature `services/*`
 * files. Keeping this indirection means services depend on a small, typed
 * surface rather than Axios directly, which makes them easy to test/mock.
 */
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.get<T>(url, config);
    return response.data;
  },
  post: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await httpClient.post<T>(url, body, config);
    return response.data;
  },
  put: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await httpClient.put<T>(url, body, config);
    return response.data;
  },
  patch: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await httpClient.patch<T>(url, body, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.delete<T>(url, config);
    return response.data;
  },
};
