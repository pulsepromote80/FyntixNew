


import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/spr-admin/lib/env";
import { createBackendClient } from "@/spr-admin/lib/backend-client";

// Route params type for Next.js
type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

// Check whether value is an object
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Common proxy handler
async function handleProxy(
  request: NextRequest,
  { params }: RouteContext
) {
  // 1. Session Validation
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  let token = "";

  try {
    const session: unknown = JSON.parse(sessionCookie);

    token =
      isRecord(session) && typeof session.token === "string"
        ? session.token
        : "";

    if (!token) {
      throw new Error("No token");
    }
  } catch {
    return NextResponse.json(
      { message: "Invalid session" },
      { status: 401 }
    );
  }

  // 2. URL Construction
  const { path } = await params;
  const pathString = path.join("/");

  // Preserve query params
  const searchParams = request.nextUrl.search;

  // 3. Body Handling (POST, PUT, PATCH)
  let bodyData: unknown = undefined;

  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      const text = await request.text();
      bodyData = text ? JSON.parse(text) : undefined;
    } catch {
      return NextResponse.json(
        { message: "A valid JSON body is required" },
        { status: 400 }
      );
    }
  }

  // 4. Forward Request to Backend
  try {
    const backend = createBackendClient(token);

    const response = await backend.request({
      method: request.method,
      url: `/${pathString}${searchParams}`,
      data: bodyData,
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error(
      `Proxy Error [${request.method} /${pathString}]:`,
      error
    );

    // Extract backend error response
    const responseData =
      isRecord(error) && isRecord(error.response)
        ? error.response.data
        : undefined;

    const message =
      isRecord(responseData) && typeof responseData.message === "string"
        ? responseData.message
        : "Failed to process request from backend";

    // Extract backend status code
    const backendStatus =
      isRecord(error) &&
      isRecord(error.response) &&
      typeof error.response.status === "number" &&
      error.response.status >= 400 &&
      error.response.status < 500
        ? error.response.status
        : 502;

    return NextResponse.json(
      { message },
      { status: backendStatus }
    );
  }
}

// 5. Export HTTP Methods
export async function GET(req: NextRequest, ctx: RouteContext) {
  return handleProxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return handleProxy(req, ctx);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return handleProxy(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return handleProxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return handleProxy(req, ctx);
}
