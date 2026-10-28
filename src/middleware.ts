

import { NextResponse, type NextRequest } from "next/server";


const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "user_session_token";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/users",
  "/transactions",
  "/settings",
];

const AUTH_PATHS = ["/login", "/forgot-password", "/reset-password"];


// (admin se aane wala callback yahan aayega, usse redirect nahi hona chahiye)
const PUBLIC_PATHS = ["/auth/callback"];

function isPathMatch(pathname: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ STEP 1: Public paths sabse pehle check karo — koi auth logic nahi
  if (isPathMatch(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

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