import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { signAppToken } from "@/lib/auth/sign-app-token";
import { signGuestToken } from "@/lib/auth/sign-guest-token";
import { createServiceClient } from "@/lib/supabase/service";
import { Account } from "@lens-protocol/client";
import { NextResponse } from "next/server";

async function migrateGuestData(guestAddress: string, newAddress: string) {
  const db = await createServiceClient();

  await db.from("drafts").update({ address: newAddress }).eq("address", guestAddress);

  await db.from("feedback").update({ address: newAddress }).eq("address", guestAddress);

  await db.from("users").update({ isAnonymous: false, address: newAddress }).eq("address", guestAddress);
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

  const { data: existingUser } = await db.from("users").select().eq("address", account.address).single();

  if (!existingUser) {
    const { error: insertError } = await db.from("users").insert({
      address: account.address,
      handle: account.username?.localName ?? null,
      isAnonymous: false,
      name: account.metadata?.name ?? null,
      owner: account.owner ?? null,
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
        handle: account.username?.localName ?? null,
        name: account.metadata?.name ?? null,
        address: account.address ?? null,
        owner: account.owner ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq("address", account.address);

    if (updateError) {
      console.error("Error updating user record:", updateError);
      throw new Error("Failed to update user record");
    }
  }
}
