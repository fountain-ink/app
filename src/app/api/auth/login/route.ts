import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { signAppToken } from "@/lib/auth/sign-app-token";
import { signGuestToken } from "@/lib/auth/sign-guest-token";
import { createServiceClient } from "@/lib/supabase/service";
import { Account } from "@lens-protocol/client";
import { NextResponse } from "next/server";

async function migrateGuestData(guestId: string, newAddress: string) {
  const db = await createServiceClient();

  await db.from("drafts").update({ authorId: newAddress }).eq("authorId", guestId);

  await db.from("feedback").update({ userId: newAddress }).eq("userId", guestId);

  await db.from("users").update({ isAnonymous: false, profileId: newAddress }).eq("profileId", guestId);
}

export async function POST(req: Request) {
  try {
    console.log("[Login] Starting authentication process");
    const { refreshToken, appToken } = await req.json();

    if (!refreshToken) {
      console.log("[Login] Creating guest token");
      const { jwt, username } = await signGuestToken();
      return NextResponse.json({ jwt, username }, { status: 200 });
    }

    console.log("[Login] Creating authenticated token");
    const { jwt, account } = await signAppToken(refreshToken);
    await manageUserRecord(account);

    // If there's an existing guest token, migrate the data
    if (appToken) {
      const guestClaims = getTokenClaims(appToken);
      if (guestClaims?.metadata?.isAnonymous) {
        console.log("[Login] Migrating guest data from ", guestClaims.sub, " to ", account.address);
        await migrateGuestData(guestClaims.sub, account.address);
      }
    }

    return NextResponse.json({ jwt, handle: account.username }, { status: 200 });
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 },
    );
  }
}

async function manageUserRecord(account: Account | null) {
  if (!account) return;

  const db = await createServiceClient();

  // Check if user exists
  const { data: existingUser } = await db.from("users").select().eq("profileId", account.address).single();

  if (!existingUser) {
    // Create new user record
    const { error: insertError } = await db.from("users").insert({
      profileId: account.address,
      handle: account.username?.localName ?? null,
      isAnonymous: false,
      name: account.metadata?.name ?? null,
      address: account.owner ?? null,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error creating user record:", insertError);
      throw new Error("Failed to create user record");
    }
  } else {
    // Update existing user record
    const { error: updateError } = await db
      .from("users")
      .update({
        handle: account.username?.localName ?? null,
        name: account.metadata?.name ?? null,
        address: account.owner ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq("profileId", account.address);

    if (updateError) {
      console.error("Error updating user record:", updateError);
      throw new Error("Failed to update user record");
    }
  }
}
