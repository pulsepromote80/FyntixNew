import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

/**
 * POST /api/AdminAuthentication/adminUserLogin
 *
 * Proxies the userid and password to the .NET backend
 * for admin user login
 */

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.userid || !body?.autokey) {
    return NextResponse.json(
      { success: false, message: "userid and autokey are required" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient();
    const { data: responseData } = await backend.post<unknown>(
      "/AdminAuthentication/adminUserLogin",
      {
        userid: body.userid,
        autokey: body.autokey,
      },
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Admin user login error:", error);
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
        : "Admin user login failed";

    return NextResponse.json({ success: false, message }, { status });
  }
}
