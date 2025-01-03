import { createServiceClient } from "@/lib/supabase/service";
import type { ProfileFragment } from "@lens-protocol/client";

export async function manageUserRecord(profile: ProfileFragment | null) {
  if (!profile) return;

  const db = await createServiceClient();

  // Check if user exists
  const { data: existingUser } = await db.from("users").select().eq("profileId", profile.id).single();

  if (!existingUser) {
    // Create new user record
    const { error: insertError } = await db.from("users").insert({
      profileId: profile.id,
      handle: profile.handle?.localName ?? null,
      isAnonymous: false,
      name: profile.metadata?.displayName ?? null,
      address: profile.ownedBy?.address ?? null,
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
        handle: profile.handle?.localName ?? null,
        name: profile.metadata?.displayName ?? null,
        address: profile.ownedBy?.address ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq("profileId", profile.id);

    if (updateError) {
      console.error("Error updating user record:", updateError);
      throw new Error("Failed to update user record");
    }
  }
}
