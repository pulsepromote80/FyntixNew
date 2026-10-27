import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const referralId = searchParams.get("referralId");

  if (!referralId) {
    return NextResponse.json(
      { success: false, message: "Referral ID is required" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient();
    const { data } = await backend.get(`/Authentication/getByReferralId?userid=${referralId}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Referral validation error:", error);
    return NextResponse.json(
      { success: false, message: "Referral validation failed" },
      { status: 500 },
    );
  }
}
