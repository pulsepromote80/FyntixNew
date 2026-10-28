import { z } from "zod";

const serverEnvSchema = z.object({
  BACKEND_API_URL: z.string().url(),
  SPR_ADMIN_BACKEND_API_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().min(1),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

/**
 * Server-only environment variables
 */
export function getServerEnv() {
  const values = {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    SPR_ADMIN_BACKEND_API_URL: process.env.SPR_ADMIN_BACKEND_API_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SESSION_COOKIE_NAME:
      process.env.SPR_ADMIN_SESSION_COOKIE_NAME || "admin_session_token",
  };

  const parsed = serverEnvSchema.safeParse(values);

  if (!parsed.success) {
    // Allow Next.js build to complete when runtime env values
    // are not available during the build process.
    if (
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NODE_ENV === "test"
    ) {
      return {
        BACKEND_API_URL:
          process.env.BACKEND_API_URL ||
          "https://placeholder-api-url.com/api",
        SPR_ADMIN_BACKEND_API_URL:
          process.env.SPR_ADMIN_BACKEND_API_URL ||
          "https://placeholder-api-url.com/api",

        AUTH_SECRET:
          process.env.AUTH_SECRET ||
          "placeholder-secret-for-build",

        SESSION_COOKIE_NAME:
          process.env.SPR_ADMIN_SESSION_COOKIE_NAME || "admin_session_token",
      };
    }

    throw new Error(
      `Invalid server environment variables: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

/**
 * Public environment variables
 */
const publicEnvValues = {
  NEXT_PUBLIC_APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME || "App",

  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

const publicParsed = publicEnvSchema.safeParse(publicEnvValues);

export const publicEnv = publicParsed.success
  ? publicParsed.data
  : {
      NEXT_PUBLIC_APP_NAME: "App",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };