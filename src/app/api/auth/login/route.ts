import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { signAppToken } from "@/lib/auth/sign-app-token";
import { signGuestToken } from "@/lib/auth/sign-guest-token";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

async function migrateGuestData(guestId: string, newProfileId: string) {
  const db = await createServiceClient();

  await db.from("drafts").update({ authorId: newProfileId }).eq("authorId", guestId);
  await db.from("feedback").update({ userId: newProfileId }).eq("userId", guestId);
  await db.from("users").update({ isAnonymous: false, profileId: newProfileId }).eq("profileId", guestId);
}

export async function POST(req: Request) {
  try {
    console.log("[Login] Starting authentication process");
    const { refreshToken, appToken } = await req.json();

    // Handle guest authentication
    if (!refreshToken) {
      console.log("[Login] Creating guest token");
      const { jwt, handle } = await signGuestToken();
      return NextResponse.json({ jwt, handle }, { status: 200 });
    }

    console.log("[Login] Creating authenticated token");
    const { jwt, profile } = await signAppToken(refreshToken);

    // If there's an existing guest token, migrate the data
    if (appToken) {
      const guestClaims = getTokenClaims(appToken);
      if (guestClaims?.user_metadata?.isAnonymous) {
        console.log("[Login] Migrating guest data from", guestClaims.sub, "to", profile.profileId);
        await migrateGuestData(guestClaims.sub, profile.profileId);
      }
    }

    return NextResponse.json({ jwt, handle: profile.handle }, { status: 200 });
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 },
    );
  }
}
