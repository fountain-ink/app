import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("[Guest Login] Starting anonymous authentication");
    const supabase = await createServiceClient();

    console.log("[Guest Login] Creating anonymous user");
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInAnonymously();

    if (signInError) {
      console.error("[Guest Login] Failed to create anonymous user:", signInError);
      return NextResponse.json({ error: "Failed to create anonymous user" }, { status: 500 });
    }

    if (!user?.id) {
      console.error("[Guest Login] No user ID returned from anonymous sign in");
      return NextResponse.json({ error: "Failed to create anonymous user" }, { status: 500 });
    }

    console.log("[Guest Login] Creating user profile");
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      handle: `guest-${user.id.slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      isAnonymous: true,
    });

    if (insertError) {
      console.error("[Guest Login] Failed to create user profile:", insertError);
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
    }

    // Get the session which contains the JWT token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.error("[Guest Login] Failed to get session:", sessionError);
      return NextResponse.json({ error: "Failed to get session token" }, { status: 500 });
    }

    console.log("[Guest Login] Successfully created anonymous user: ", session.user.id);
    return NextResponse.json({ token: session.access_token });
  } catch (error) {
    console.error("[Guest Login Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create guest account" },
      { status: 500 },
    );
  }
}
