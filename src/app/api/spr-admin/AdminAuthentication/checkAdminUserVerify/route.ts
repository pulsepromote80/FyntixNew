import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

/**
 * GET /api/AdminAuthentication/checkAdminUserVerify
 *
 * Proxies the LoginID parameter to the .NET backend
 * to verify admin user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const loginID = searchParams.get("LoginID");
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!loginID) {
    return NextResponse.json(
      { success: false, message: "LoginID is required" },
      { status: 400 },
    );
  }

  if (!sessionCookie) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  let token: string | undefined;
  try {
    const session = JSON.parse(sessionCookie);
    token = typeof session?.token === "string" ? session.token : undefined;
  } catch (error) {
    console.error("Session parse error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid session" },
      { status: 401 },
    );
  }

  try {
    const backend = createBackendClient(token);
    const { data: responseData } = await backend.get<unknown>(
      "/AdminAuthentication/checkAdminUserVerify",
      {
        params: {
          LoginID: loginID,
        },
      },
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Check admin user verify error:", error);
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response &&
      typeof error.response.status === "number" &&
      error.response.status >= 400 &&
      error.response.status < 500
        ? error.response.status
        : 502;
    const responseData =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response
        ? error.response.data
        : undefined;
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
        ? responseData.message
        : "Failed to verify admin user";

    return NextResponse.json({ success: false, message }, { status });
  }
}
