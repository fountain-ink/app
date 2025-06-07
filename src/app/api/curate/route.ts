import { createClient } from "@/lib/db/server";
import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    // Calculate offset
    const offset = (page - 1) * limit;

    // bypass RLS is fine for curated posts fetching
    const supabase = await createServiceClient();

    if (slug) {
      // Fetch specific curated post
      const { data, error } = await supabase.from("curated").select("*").eq("slug", slug);

      if (error) {
        console.error("Error fetching curated post:", error);
        return NextResponse.json({ error: "Failed to fetch curated post" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }
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
      totalCount: count,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
