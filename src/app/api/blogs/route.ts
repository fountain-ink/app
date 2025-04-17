import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("[Blogs Fetch] Fetching blogs from database");

  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      console.log("[Blogs Fetch] No auth token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      console.log("[Blogs Fetch] Invalid token claims");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userAddress = claims.metadata.address;
    console.log(`[Blogs Fetch] User authenticated: ${userAddress}`);

    const db = await createClient();

    console.log(`[Blogs Fetch] Fetching blogs for user: ${userAddress}`);
    const { data: userBlogs, error } = await db.from("blogs").select("*").eq("owner", userAddress);

    if (error) {
      console.error("[Blogs Fetch] Error fetching user blogs:", error);
      return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }

    console.log(`[Blogs Fetch] Found ${userBlogs?.length || 0} blogs in database`);
    return NextResponse.json({
      blogs: userBlogs || [],
    });
  } catch (error) {
    console.error("[Blogs Fetch] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
