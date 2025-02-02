import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { signAppToken } from "@/lib/auth/sign-app-token";
import { signGuestToken } from "@/lib/auth/sign-guest-token";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

async function migrateGuestData(guestAddress: string, newAddress: string) {
  const db = await createServiceClient();

  await db.from("drafts").update({ author: newAddress }).eq("address", guestAddress);

  await db.from("feedback").update({ author: newAddress }).eq("address", guestAddress);

  await db.from("users").update({ isAnonymous: false, address: newAddress }).eq("address", guestAddress);
}

export async function POST(req: Request) {
  try {
    console.log("[Login] Starting authentication process");
    const { refreshToken, appToken } = await req.json();

    if (!refreshToken) {
      console.log("[Login] Creating guest token");
      const jwt = await signGuestToken();
      const claims = getTokenClaims(jwt);
      if (!claims) throw new Error("Failed to create guest token");

      return NextResponse.json(
        {
          jwt,
          username: claims.metadata.username,
        },
        { status: 200 },
      );
    }

    console.log("[Login] Creating authenticated token");
    const jwt = await signAppToken();
    const claims = getTokenClaims(jwt);
    if (!claims) throw new Error("Failed to create app token");

    const profile = await getUserProfile();
    if (!profile) throw new Error("Failed to get user profile");

    await manageUserRecord(profile);

    // If there's an existing guest token, migrate the data
    if (appToken) {
      const guestClaims = getTokenClaims(appToken);
      if (guestClaims?.metadata?.isAnonymous) {
        console.log("[Login] Migrating guest data from ", guestClaims.sub, " to ", claims.metadata.address);
        await migrateGuestData(guestClaims.sub, claims.metadata.address);
      }
    }

    return NextResponse.json(
      {
        jwt,
        handle: claims.metadata.username,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 },
    );
  }
}

async function manageUserRecord(profile: Awaited<ReturnType<typeof getUserProfile>>) {
  if (!profile) return;

  const db = await createServiceClient();
  const account = profile.profile?.loggedInAs?.account;

  const { data: existingUser } = await db.from("users").select().eq("address", profile.address).single();

  if (!existingUser) {
    const { error: insertError } = await db.from("users").insert({
      address: profile.address,
      handle: profile.username ?? null,
      isAnonymous: false,
      name: account?.metadata?.name ?? null,
      owner: account?.owner ?? null,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error creating user record:", insertError);
      throw new Error("Failed to create user record");
    }
  } else {
    const { error: updateError } = await db
      .from("users")
      .update({
        handle: profile.username ?? null,
        name: account?.metadata?.name ?? null,
        owner: account?.owner ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq("address", profile.address);

    if (updateError) {
      console.error("Error updating user record:", updateError);
      throw new Error("Failed to update user record");
    }
  }
}
