import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { memoryStorage } from "@/lib/cross-posting/memory-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sources from shared memory storage
    const sources = memoryStorage.getSources(params.blog);
    
    return NextResponse.json({
      sources
    });
  } catch (error) {
    console.error("Error fetching cross-posting sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch cross-posting sources" },
      { status: 500 }
    );
  }
}