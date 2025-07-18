import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/service";

// GET - Look up a post by slug and handle
export async function GET(req: NextRequest) {
  console.log("[Posts Slug Lookup] Looking up post by slug");

  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    const handle = searchParams.get("handle");

    if (!slug || !handle) {
      console.error("[Posts Slug Lookup] Missing slug or handle parameter");
      return NextResponse.json(
        {
          found: false,
          error: "Missing required parameters",
        },
        { status: 400 },
      );
    }

    // bypass RLS is fine for post lookup
    const db = await createServiceClient();

    const { data: posts, error } = await db.from("posts").select("lens_slug").eq("slug", slug).eq("handle", handle);

    if (error) {
      console.error("[Posts Slug Lookup] Error looking up post:", error);
      return NextResponse.json(
        {
          found: false,
          error: "Database error",
        },
        { status: 500 },
      );
    }

    if (posts && posts.length > 0) {
      console.log(`[Posts Slug Lookup] Found post for slug '${slug}' and handle '${handle}'`);
      return NextResponse.json({
        found: true,
        lens_slug: posts[0]?.lens_slug,
      });
    }
    console.log(`[Posts Slug Lookup] No post found for slug '${slug}' and handle '${handle}'`);
    return NextResponse.json({
      found: false,
    });
  } catch (error) {
    console.error("[Posts Slug Lookup] Unexpected error:", error);
    return NextResponse.json(
      {
        found: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
