import { NextResponse } from "next/server";
import { createBackendClient } from "@/lib/backend-client";


export async function GET() {
  try {
    const backend = createBackendClient();
    const { data } = await backend.get("/Geography/getAllCountry");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Countries fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch countries" },
      { status: 500 },
    );
  }
}
