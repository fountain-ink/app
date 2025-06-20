import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { Json } from "@/lib/db/database";
import { createClient } from "@/lib/db/server";

export async function PUT(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const { metadata } = await req.json();
    if (!metadata) {
      return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
    }

    const db = await createClient();
    const { error } = await db
      .from("users")
      .update({
        metadata: metadata as Json,
        updatedAt: new Date().toISOString(),
      })
      .eq("address", claims.metadata.address);

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

export const dynamic = "force-dynamic";
