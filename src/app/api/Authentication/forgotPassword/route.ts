import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";
import axios from "axios";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.UserId || !body?.Email) {
    return NextResponse.json(
      { success: false, message: "UserId and Email are required" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient();
    const backendResponse = await backend.post("/Authentication/forgotPassword", {
      UserId: body.UserId,
      Email: body.Email,
    });

    const { statusCode, message } = backendResponse.data;

    return NextResponse.json({
      statusCode,
      message,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Failed to send reset link";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to send reset link" },
      { status: 500 },
    );
  }
}
