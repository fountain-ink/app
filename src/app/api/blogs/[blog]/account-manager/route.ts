import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

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

    // TODO: Implement account manager status check
    // - Check if delegation exists for this blog
    // - Return delegation status and permissions
    
    // For now, return mock response
    return NextResponse.json({
      is_delegated: false,
      status: 'none'
    });
  } catch (error) {
    console.error("Error fetching account manager status:", error);
    return NextResponse.json(
      { error: "Failed to fetch account manager status" },
      { status: 500 }
    );
  }
}