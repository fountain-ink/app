import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { Json } from "@/lib/supabase/database";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.user_metadata?.profileId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { metadata } = await req.json();
    if (!metadata) {
      return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
    }

    const db = await createServiceClient();
    const { error } = await db
      .from("users")
      .update({
        metadata: metadata as Json,
        updatedAt: new Date().toISOString(),
      })
      .eq("profileId", claims.user_metadata.profileId);

    if (error) {
      console.error("Error updating user settings:", error);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in settings update:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.user_metadata?.profileId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await createServiceClient();
    const { data, error } = await db
      .from("users")
      .select("metadata")
      .eq("profileId", claims.user_metadata.profileId)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    return NextResponse.json({ metadata: data?.metadata || {} });
  } catch (error) {
    console.error("Error in settings fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
