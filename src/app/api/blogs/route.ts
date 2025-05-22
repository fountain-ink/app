import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { createClient } from "@/lib/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("[Blogs Fetch] Fetching blogs from database");

  try {
    const { claims, error } = verifyAuth(req);
    if (error) {
      console.log("[Blogs Fetch] No auth token found or invalid token");
      return error;
    }

    const userAddress = claims.metadata.address;
    console.log(`[Blogs Fetch] User authenticated: ${userAddress}`);

    const db = await createClient();

    console.log(`[Blogs Fetch] Fetching blogs for user: ${userAddress}`);
    const { data: userBlogs, error: dbError } = await db.from("blogs").select("*").eq("owner", userAddress);

    if (dbError) {
      console.error("[Blogs Fetch] Error fetching user blogs:", dbError);
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
