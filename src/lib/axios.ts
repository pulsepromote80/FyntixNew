// import axios from "axios";

// export const httpClient = axios.create({
//   baseURL: "/api",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// httpClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (axios.isAxiosError(error) && error.response?.status === 401) {
//       if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
//         const { useAuthStore } = require("@/store/auth.store");
//         useAuthStore.getState().clearUser();
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   },
// );


// lib/httpClient.ts — NO CHANGE
import axios from "axios";

export const httpClient = axios.create({
  baseURL: "/api",
  withCredentials: true,  
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        const { useAuthStore } = require("@/store/auth.store");
        useAuthStore.getState().clearUser();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);