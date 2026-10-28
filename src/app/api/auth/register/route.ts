import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";


export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.fName || !body?.lName || !body?.password || !body?.email || !body?.introSide) {
    return NextResponse.json(
      { success: false, message: "All required fields must be provided" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient();
    const { data } = await backend.post("/Authentication/userRegistration", body);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 },
    );
  }
}
