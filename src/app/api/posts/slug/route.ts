import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("[Posts Slug] Looking up post by slug");

  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
      console.error("[Posts Slug] Missing slug parameter");
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const db = await createServiceClient();

    let { data: post, error } = await db.from("posts").select("*").eq("slug", slug).single();

    if (error && error.code === "PGRST116") {
      console.log("[Posts Slug] Not found by custom slug, trying lens_slug");
      const result = await db.from("posts").select("*").eq("lens_slug", slug).single();
      post = result.data;
      error = result.error;
    }

    if (error) {
      console.error("[Posts Slug] Error finding post:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to find post" }, { status: 500 });
    }

    console.log(`[Posts Slug] Found post with ID: ${post?.id}`);
    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("[Posts Slug] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to find post" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
