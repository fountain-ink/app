import { createClient } from "@/lib/db/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Check if slug is available for a specific handle
export async function GET(req: NextRequest) {
  console.log("[Posts Slug Check] Checking if slug is available");

  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    const handle = searchParams.get("handle");

    if (!slug) {
      console.error("[Posts Slug Check] Missing slug parameter");
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    // If no handle is provided, assume it's available (since we need handle-specific uniqueness)
    if (!handle) {
      console.log("[Posts Slug Check] No handle provided, assuming available");
      return NextResponse.json({
        available: true,
        slug: slug,
      });
    }

    const db = await createClient();

    // Check if slug exists for this specific handle
    const { data: existingPosts, error } = await db.from("posts").select("id").eq("slug", slug).eq("handle", handle);

    if (error) {
      console.error("[Posts Slug Check] Error checking slug availability:", error);
      return NextResponse.json({ error: "Failed to check slug availability" }, { status: 500 });
    }

    const isAvailable = !existingPosts || existingPosts.length === 0;

    console.log(
      `[Posts Slug Check] Slug '${slug}' for handle '${handle}' is ${isAvailable ? "available" : "already taken"}`,
    );
    return NextResponse.json({
      available: isAvailable,
      slug: slug,
    });
  } catch (error) {
    console.error("[Posts Slug Check] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check slug availability" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
