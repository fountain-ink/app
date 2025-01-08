import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidateTag } from "next/cache";
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

    const { metadata, email } = await req.json();
    if (!metadata) {
      return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
    }

    const db = await createServiceClient();
    const updateData: any = {
      metadata,
      updatedAt: new Date().toISOString(),
    };

    // Only include email in update if it's provided
    if (email !== undefined) {
      updateData.email = email;
    }

    const { error } = await db.from("users").update(updateData).eq("profileId", claims.user_metadata.profileId);

    if (error) {
      console.error("Error updating user settings:", error);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    // Revalidate the user's settings tag
    revalidateTag(`user-${claims.user_metadata.profileId}-settings`);

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
      .select("metadata, email")
      .eq("profileId", claims.user_metadata.profileId)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    return NextResponse.json({ metadata: data?.metadata || {}, email: data?.email || null });
  } catch (error) {
    console.error("Error in settings fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
