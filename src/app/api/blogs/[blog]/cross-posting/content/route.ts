import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getCrossPostedContent } from "@/lib/cross-posting/content-storage";

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

    // Get cross-posted content from storage
    const content = getCrossPostedContent(params.blog);
    
    return NextResponse.json({
      content
    });
  } catch (error) {
    console.error("Error fetching cross-posted content:", error);
    return NextResponse.json(
      { error: "Failed to fetch cross-posted content" },
      { status: 500 }
    );
  }
}