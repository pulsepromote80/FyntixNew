import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

/**
 * GET /api/dashboard
 * Proxies to the .NET backend's dashboard summary endpoint.
 */
export async function GET(request: NextRequest) {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(sessionCookie);
    const token = sessionData.token;

    const backend = createBackendClient(token);
    const { data } = await backend.get("/AdminAuthentication/getAdminDashboardDetails", {
      timeout: 10000, 
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
