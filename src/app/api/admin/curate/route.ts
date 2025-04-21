import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminRights } from "@/lib/auth/admin-middleware";

// GET - Fetch all curated posts
export async function GET(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Calculate offset
    const offset = (page - 1) * limit;

    const supabase = await createServiceClient();

    if (slug) {
      // Fetch specific curated post
      const { data, error } = await supabase
        .from("curated")
        .select("*")
        .eq("slug", slug);

      if (error) {
        console.error("Error fetching curated post:", error);
        return NextResponse.json({ error: "Failed to fetch curated post" }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // Fetch paginated curated posts
      const { data, error, count } = await supabase
        .from("curated")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching curated posts:", error);
        return NextResponse.json({ error: "Failed to fetch curated posts" }, { status: 500 });
      }

      const hasMore = count ? offset + limit < count : false;

      return NextResponse.json({
        data,
        hasMore,
        page,
        totalCount: count
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// POST - Add a post to curated list
export async function POST(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const body = await req.json();
    const { slug, added_by } = body;

    if (!slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Check if entry already exists
    const { data: existingEntry } = await supabase
      .from("curated")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (existingEntry) {
      return NextResponse.json({ error: "Post already curated" }, { status: 409 });
    }

    const { error } = await supabase
      .from("curated")
      .insert({
        slug,
        added_by,
      });

    if (error) {
      console.error("Error adding post to curated list:", error);
      return NextResponse.json({ error: "Failed to add post to curated list" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// DELETE - Remove a post from curated list
export async function DELETE(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { error } = await supabase
      .from("curated")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error("Error removing post from curated list:", error);
      return NextResponse.json({ error: "Failed to remove post from curated list" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
} 