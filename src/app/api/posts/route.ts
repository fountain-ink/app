import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/db/server";
import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch posts for a user
export async function GET(req: NextRequest) {
  console.log("[Posts Fetch] Fetching posts from database");

  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      console.log("[Posts Fetch] No auth token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      console.log("[Posts Fetch] Invalid token claims");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userAddress = claims.metadata.address;
    console.log(`[Posts Fetch] User authenticated: ${userAddress}`);

    const db = await createServiceClient();

    const { data: userPosts, error } = await db.from("posts").select("*").eq("author", userAddress);

    if (error) {
      console.error("[Posts Fetch] Error fetching user posts:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    console.log(`[Posts Fetch] Found ${userPosts?.length || 0} posts in database`);
    return NextResponse.json({
      posts: userPosts || [],
    });
  } catch (error) {
    console.error("[Posts Fetch] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// POST - Create or update a post record
export async function POST(req: NextRequest) {
  console.log("[Posts Create/Update] Creating or updating post record");

  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      console.log("[Posts Create/Update] No auth token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      console.log("[Posts Create/Update] Invalid token claims");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userAddress = claims.metadata.address;
    console.log(`[Posts Create/Update] User authenticated: ${userAddress}`);

    // Parse request body
    const body = await req.json();
    const { lens_slug, slug, handle, post_id } = body;

    if (!lens_slug) {
      console.error("[Posts Create/Update] Missing lens_slug in request");
      return NextResponse.json({ error: "Missing lens_slug" }, { status: 400 });
    }

    const db = await createServiceClient();

    if (post_id) {
      console.log(`[Posts Update] Attempting to update post with ID: ${post_id}`);

      const { data: existingPost } = await db
        .from("posts")
        .select("*")
        .eq("id", post_id)
        .eq("author", userAddress)
        .single();

      if (!existingPost) {
        console.error("[Posts Update] Post not found or doesn't belong to user");
      } else {
        const { data: updatedPost, error: updateError } = await db
          .from("posts")
          .update({
            lens_slug,
            slug,
            handle,
          })
          .eq("id", post_id)
          .select()
          .single();

        if (updateError) {
          console.error("[Posts Update] Error updating post record:", updateError);
          return NextResponse.json({ error: "Failed to update post record" }, { status: 500 });
        }

        console.log(`[Posts Update] Updated post record with ID: ${post_id}`);
        return NextResponse.json({
          success: true,
          post: updatedPost,
        });
      }
    }

    // Create new post record
    const { data: newPost, error } = await db
      .from("posts")
      .insert({
        author: userAddress,
        handle,
        lens_slug,
        slug,
        created_at: new Date().toISOString(),
        id: post_id,
      })
      .select()
      .single();

    if (error) {
      console.error("[Posts Create] Error creating post record:", error);
      return NextResponse.json({ error: "Failed to create post record" }, { status: 500 });
    }

    console.log(`[Posts Create] Created post record with ID: ${newPost?.id}`);
    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error("[Posts Create/Update] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create/update post record" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
