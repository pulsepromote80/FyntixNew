import type { AxiosRequestConfig } from "axios";
import { proxyClient } from "@/spr-admin/lib/axios";

/**
 * Thin, typed wrapper around the Proxy Axios instance.
 * Used specifically for routes that map to /api/proxy/*.
 */
export const proxyApiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await proxyClient.get<T>(url, config);
    return response.data;
  },
  post: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await proxyClient.post<T>(url, body, config);
    return response.data;
  },
  put: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await proxyClient.put<T>(url, body, config);
    return response.data;
  },
  patch: async <T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await proxyClient.patch<T>(url, body, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await proxyClient.delete<T>(url, config);
    return response.data;
  },
};