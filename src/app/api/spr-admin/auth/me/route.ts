import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";

function isAuthenticatedUser(value: unknown): value is {
  id: string;
  name: string;
  email: string;
  roles: string[];
  adminUserId?: string;
  loginId?: string;
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    Array.isArray(user.roles) &&
    user.roles.every((role) => typeof role === "string") &&
    (user.adminUserId === undefined || typeof user.adminUserId === "string") &&
    (user.loginId === undefined || typeof user.loginId === "string")
  );
}

/**
 * GET /api/auth/me
 * Returns the normalized profile stored in the server-managed session.
 */
export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    if (!isAuthenticatedUser(session?.userData)) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(session.userData);
  } catch (error) {
    console.error("Session profile read error:", error);
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }
}
