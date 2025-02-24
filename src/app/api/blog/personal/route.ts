import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);
    
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const { data: blogSettings, error } = await db
      .from("blogs")
      .select()
      .eq("address", claims.sub)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ...blogSettings,
      userAddress: claims.metadata.address,
    });
  } catch (error) {
    console.error("Error in personal blog API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 