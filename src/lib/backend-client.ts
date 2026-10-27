import "server-only";
import axios from "axios";
import { getServerEnv } from "@/lib/env";

export function createBackendClient(accessToken?: string) {
  const { BACKEND_API_URL } = getServerEnv();

  return axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    timeout: 60000,
  });
}
