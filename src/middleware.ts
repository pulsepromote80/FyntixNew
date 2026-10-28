import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "user_session_token";
const ADMIN_SESSION_COOKIE_NAME =
  process.env.SPR_ADMIN_SESSION_COOKIE_NAME ?? "admin_session_token";

const PROTECTED_PATHS = ["/dashboard", "/profile", "/users", "/transactions", "/settings"];

const AUTH_PATHS = ["/login", "/forgot-password", "/reset-password"];

// (admin se aane wala callback yahan aayega, usse redirect nahi hona chahiye)
const PUBLIC_PATHS = ["/auth/callback"];

const ADMIN_ROOT_PATH = "/spr-admin";
const ADMIN_AUTH_PATHS = new Set([
  "/spr-admin/login",
  "/spr-admin/forgot-password",
  "/spr-admin/reset-password",
]);

function isPathMatch(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getAdminToken(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;

  try {
    const session: unknown = JSON.parse(cookieValue);
    if (
      typeof session === "object" &&
      session !== null &&
      "token" in session &&
      typeof session.token === "string" &&
      session.token.trim()
    ) {
      return session.token;
    }
  } catch {
    return null;
  }

  return null;
}

function isAdminTokenValid(token: string | null): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    const payload = parts[1];
    if (!payload) return false;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );
    const claims: unknown = JSON.parse(atob(paddedPayload));
    if (typeof claims !== "object" || claims === null) return false;

    const expiration = "exp" in claims ? claims.exp : undefined;
    return typeof expiration !== "number" || expiration > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPathname = pathname.replace(/\/+$/, "") || "/";

  if (adminPathname === ADMIN_ROOT_PATH || adminPathname.startsWith(`${ADMIN_ROOT_PATH}/`)) {
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const hasValidAdminSession = isAdminTokenValid(getAdminToken(adminSession));

    if (adminPathname === ADMIN_ROOT_PATH) {
      return NextResponse.redirect(
        new URL(hasValidAdminSession ? "/spr-admin/dashboard" : "/spr-admin/login", request.url),
      );
    }

    if (ADMIN_AUTH_PATHS.has(adminPathname)) {
      if (hasValidAdminSession) {
        return NextResponse.redirect(new URL("/spr-admin/dashboard", request.url));
      }

      return NextResponse.next();
    }

    if (!hasValidAdminSession) {
      const loginUrl = new URL("/spr-admin/login", request.url);
      loginUrl.searchParams.set("from", adminPathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ✅ STEP 1: Public paths sabse pehle check karo — koi auth logic nahi
  if (isPathMatch(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  // STEP 2: Protected route + no session → /login pe bhejo
  if (isPathMatch(pathname, PROTECTED_PATHS) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // STEP 3: Auth route + already logged in → /dashboard pe bhejo
  if (isPathMatch(pathname, AUTH_PATHS) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // STEP 4: Baaki sab kuch pass hone do
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/spr-admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/users/:path*",
    "/transactions/:path*",
    "/settings/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
  ],
};
