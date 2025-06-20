import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/service";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const includeEnded = url.searchParams.get("includeEnded") === "true";

    const supabase = await createServiceClient();

    let query = supabase.from("contests").select("id, slug, name, theme, status, prize_pool");

    if (!includeEnded) {
      query = query.in("status", ["active", "upcoming"]);
    }

    const { data, error } = await query.order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching contests:", error);
      return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
