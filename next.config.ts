import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * Notes:
 * - No backend URL is ever exposed here via `env` or `NEXT_PUBLIC_*`.
 * - Backend calls are proxied server-side through Route Handlers
 *   (see src/app/api/**) so the browser never talks to the .NET API directly.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Add allowed remote image hosts here as needed, e.g.:
      // { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
