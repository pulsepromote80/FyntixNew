import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";
import axios from "axios";


export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.userid || !body?.password) {
    return NextResponse.json(
      { success: false, message: "userid and password are required" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient();
    const { data } = await backend.post("/SMTP/sendOtpLoginEmail", body);

    return NextResponse.json(data);
  } catch (error) {
    console.error("OTP send error:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP";
      // Suppress the specific 401 error message about incorrect credentials
      if (errorMessage === "Details are incorrect, please enter correct credentials.") {
        return NextResponse.json(
          { success: false, message: "Invalid userid or password" },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 },
    );
  }
}
