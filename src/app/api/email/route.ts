import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { createClient } from "@/lib/db/server";

export async function PUT(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const { email } = await req.json();
    if (email === undefined) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    const db = await createClient();
    const { error } = await db
      .from("users")
      .update({
        email,
        updatedAt: new Date().toISOString(),
      })
      .eq("address", claims.metadata.address);

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

export const dynamic = "force-dynamic";
