import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/spr-admin/lib/backend-client";
import { getServerEnv } from "@/spr-admin/lib/env";

/**
 * POST /api/admin/user-login
 *
 * Combined endpoint: Verifies user and performs login in one request
 * Hides backend endpoints from network tab
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.LoginID) {
    return NextResponse.json(
      { success: false, message: "LoginID is required" },
      { status: 400 },
    );
  }

  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

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

    // Step 1: Verify user
    const { data: verifyData } = await backend.get<unknown>(
      "/AdminAuthentication/checkAdminUserVerify",
      {
        params: {
          LoginID: body.LoginID,
        },
      },
    );

    const verifyUser = (verifyData as { data?: Record<string, unknown>[] })?.data?.[0];
    if (!verifyUser?.AuthLogin || !verifyUser?.autokey) {
      return NextResponse.json(
        { success: false, message: "User verification failed" },
        { status: 400 },
      );
    }

    // Step 2: Login user
    const { data: loginData } = await backend.post<unknown>(
      "/AdminAuthentication/adminUserLogin",
      {
        userid: verifyUser.AuthLogin,
        autokey: verifyUser.autokey,
      },
    );

    // Prepare user data
    const userData = {
      id: verifyUser.UserId || verifyUser.Id || verifyUser.Kid,
      name: verifyUser.Fname || verifyUser.Name,
      email: verifyUser.Email || verifyUser.EmailId,
      mobile: verifyUser.Mobile,
      roles: ["User"],
    };

    // Build redirect URL with tokens in hash (hash fragments don't appear in network tab)
    const USER_APP_URL = "https://fyntix-new.vercel.app";
    const params = new URLSearchParams();
    params.set("token", (loginData as Record<string, unknown>).accessToken as string);
    if ((loginData as Record<string, unknown>).refreshToken) params.set("refresh", (loginData as Record<string, unknown>).refreshToken as string);
    if ((loginData as Record<string, unknown>).expiresIn) params.set("expires", String((loginData as Record<string, unknown>).expiresIn));
    params.set("user", encodeURIComponent(JSON.stringify(userData)));

    const redirectUrl = `${USER_APP_URL}/auth/callback#${params.toString()}`;

    // Encode redirect URL to hide it in response
    const encodedUrl = Buffer.from(redirectUrl).toString("base64");

    return NextResponse.json({
      success: true,
      message: "Login successful",
      redirect: encodedUrl,
    });
  } catch (error) {
    console.error("User login error:", error);
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
        : "User login failed";

    return NextResponse.json({ success: false, message }, { status });
  }
}
