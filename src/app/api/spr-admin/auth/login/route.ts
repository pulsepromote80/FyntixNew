import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { rateLimit, getClientIp } from "@/spr-admin/lib/rate-limiter";

interface BackendAdminUser {
  adminUserId?: string | number;
  id?: string | number;
  name?: string;
  adminName?: string;
  email?: string;
  authLogin?: string;
  role?: string | string[];
  roles?: string[];
  sub?: string;
}

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  adminUserId?: string;
  loginId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getUserFromToken(token: string, username: string): BackendAdminUser {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      throw new Error("JWT payload is missing");
    }

    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!isRecord(claims)) {
      throw new Error("JWT payload is invalid");
    }

    const name =
      claims.name ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      claims.sub;
    const role =
      claims.role ?? claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    return {
      id: typeof claims.sub === "string" ? claims.sub : username,
      name: typeof name === "string" ? name : username,
      authLogin: username,
      role: typeof role === "string" ? role : undefined,
    };
  } catch {
    return { id: username, name: username, authLogin: username };
  }
}

function normalizeUser(user: BackendAdminUser, submittedLoginId: string): AuthenticatedUser {
  const adminUserId = user.adminUserId;
  const login =
    [user.authLogin, user.email, user.sub, submittedLoginId].find(
      (value): value is string => typeof value === "string" && Boolean(value.trim()),
    ) ?? submittedLoginId;
  const roles = user.roles ?? user.role ?? [];

  return {
    id: String(adminUserId ?? user.id ?? login),
    name: (user.name ?? user.adminName ?? login) || "Admin",
    email: user.email ?? user.authLogin ?? "",
    roles: (Array.isArray(roles) ? roles : [roles]).filter(
      (role): role is string => typeof role === "string",
    ),
    loginId: login,
    ...(adminUserId !== undefined ? { adminUserId: String(adminUserId) } : {}),
  };
}

/**
 * POST /api/spr-admin/auth/login
 *
 * Proxies credentials to the .NET backend and stores its access token in an
 * HttpOnly cookie. The token is never returned in the browser response.
 */
export async function POST(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const body = await request.json().catch(() => null);

  if (!body?.username || !body?.password) {
    return NextResponse.json(
      { success: false, message: "Username and password are required" },
      { status: 400 },
    );
  }

  // Rate limiting: 5 login attempts per 15 minutes per IP
  const ip = getClientIp(request);
  const limiter = rateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
  const rateLimitResult = await limiter(`${ip}:login`);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        },
      },
    );
  }

  try {
    const backend = createBackendClient();
    const { data: responseData } = await backend.post<unknown>("/AdminAuthentication/adminLogin", {
      username: body.username,
      password: body.password,
    });

    if (!isRecord(responseData)) {
      return NextResponse.json(
        { success: false, message: "Invalid response from authentication server" },
        { status: 502 },
      );
    }

    if (
      responseData.success === false ||
      (typeof responseData.statusCode === "number" && responseData.statusCode >= 400)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            typeof responseData.message === "string"
              ? responseData.message
              : "Invalid username or password",
        },
        { status: 401 },
      );
    }

    const token = typeof responseData.token === "string" ? responseData.token : "";
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication server did not return an access token",
        },
        { status: 502 },
      );
    }

    const backendUser = isRecord(responseData.data)
      ? (responseData.data as BackendAdminUser)
      : getUserFromToken(token, body.username);
    const user = normalizeUser(backendUser, body.username);
    const response = NextResponse.json(user);
    const sessionData = JSON.stringify({ token, userData: user });

    response.cookies.set(SESSION_COOKIE_NAME, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    const status =
      isRecord(error) &&
      isRecord(error.response) &&
      typeof error.response.status === "number" &&
      error.response.status >= 400 &&
      error.response.status < 500
        ? error.response.status
        : 502;
    const responseData =
      isRecord(error) && isRecord(error.response) ? error.response.data : undefined;
    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : status === 404
          ? "Admin login endpoint was not found. Verify SPR_ADMIN_BACKEND_API_URL."
          : `Authentication failed (HTTP ${status})`;

    return NextResponse.json({ success: false, message }, { status });
  }
}
