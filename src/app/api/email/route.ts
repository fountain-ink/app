import { getTokenClaims } from "@/lib/auth/get-token-claims";
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

    const { email } = await req.json();
    if (email === undefined) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    const db = await createServiceClient();
    const { error } = await db
      .from("users")
      .update({
        email,
        updatedAt: new Date().toISOString(),
      })
      .eq("profileId", claims.user_metadata.profileId);

    if (error) {
      console.error("Error updating user email:", error);
      return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in email update:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update email" },
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
      .select("email")
      .eq("profileId", claims.user_metadata.profileId)
      .single();

    if (error) {
      console.error("Error fetching user email:", error);
      return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 });
    }

    return NextResponse.json({ email: data?.email || null });
  } catch (error) {
    console.error("Error in email fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch email" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic"; 