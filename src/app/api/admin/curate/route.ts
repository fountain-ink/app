import { NextRequest, NextResponse } from "next/server";
import { checkAdminRights } from "@/lib/auth/admin-middleware";
import { createClient } from "@/lib/db/server";

// GET - Fetch all curated posts OR check status for a specific post
export async function GET(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    // Calculate offset
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    if (slug) {
      const { data, error } = await supabase.from("curated").select("slug").eq("slug", slug).maybeSingle();

      if (error) {
        console.error("Error fetching curated status:", error);
        return NextResponse.json({ error: "Failed to fetch curated status" }, { status: 500 });
      }

      return NextResponse.json({ isFeatured: !!data });
    }
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
      totalCount: count,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

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

    const supabase = await createClient();

    const { data: existingEntry } = await supabase.from("curated").select("*").eq("slug", slug).maybeSingle();

    if (existingEntry) {
      return NextResponse.json({ error: "Post already curated" }, { status: 409 });
    }

    const { error } = await supabase.from("curated").insert({
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

    const supabase = await createClient();

    const { error } = await supabase.from("curated").delete().eq("slug", slug);

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
