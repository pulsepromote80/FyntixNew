import { NextResponse, type NextRequest } from "next/server";
import { createBackendClient } from "@/lib/backend-client";


export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.fName || !body?.lName || !body?.password || !body?.email) {
    return NextResponse.json(
      { success: false, message: "All required fields must be provided" },
      { status: 400 },
    );
  }

  try {
    const backend = createBackendClient();

    // Transform camelCase to PascalCase for backend
    const backendBody = {
      FName: body.fName,
      LName: body.lName,
      Password: body.password,
      Email: body.email,
      IntroAuth: body.introAuth || undefined,
    };

    const { data } = await backend.post("/Authentication/userRegistration", backendBody);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 },
    );
  }
}
