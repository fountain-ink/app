import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { addresses } = await req.json();
    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json({ error: "Invalid addresses" }, { status: 400 });
    }

    const db = await createClient();
    const { data: blogs, error } = await db
      .from("blogs")
      .select("*")
      .in("address", addresses);

    if (error) {
      console.error("Error fetching blog settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    return NextResponse.json({ blogs: blogs || [] });
  } catch (error) {
    console.error("Error in blogs fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 }
    );
  }
} 