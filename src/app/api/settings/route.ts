import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { Json } from "@/lib/db/database";
import { createClient } from "@/lib/db/server";
import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { settings } = await req.json();
    if (!settings) {
      return NextResponse.json({ error: "No settings provided" }, { status: 400 });
    }

    const db = await createClient();
    const { error } = await db
      .from("users")
      .update({
        settings: settings as Json,
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
