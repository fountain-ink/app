import { env } from "@/env";
import { getLensClientWithToken } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { createServiceClient } from "@/lib/supabase/service";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from "@/lib/supabase/database";

type SupabaseClientType = SupabaseClient<Database>;

export async function POST(req: Request) {
  try {
    console.log("[Login] Starting authentication process");
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      console.log("[Login] Missing refresh token");
      return NextResponse.json({ error: "Refresh token is required to login" }, { status: 400 });
    }

    console.log("[Login] Proceeding with authenticated login");
    return handleAuthenticatedLogin(refreshToken);
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}


async function findExistingUser(supabase: SupabaseClientType, profileId: string) {
  console.log("[User Lookup] Checking for existing user", { profileId });
  const { data: existingUser, error: queryError } = await supabase
    .from("users")
    .select("id")
    .eq("profileId", profileId)
    .single();

  if (queryError && queryError.code !== "PGRST116") { // Ignore not found error
    console.error("[User Lookup] Database query failed:", queryError);
    throw new Error(`Database query failed: ${queryError.message}`);
  }

  if (existingUser?.id) {
    console.log("[User Lookup] Found existing user:", existingUser.id);
    return existingUser.id;
  }

  return null;
}

async function createNewUser(supabase: SupabaseClientType, profileId: string, handle: string) {
  console.log("[User Creation] Creating new user", { profileId, handle });
  
  // Create new auth user
  console.log("[User Creation] Creating auth user entry");
  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email: `${handle}@fountain.ink`,
    user_metadata: {
      profileId,
      handle,
    },
  });

  if (createError) {
    console.error("[User Creation] Failed to create auth user:", createError);
    throw new Error(`Failed to create auth user: ${createError.message}`);
  }

  // Insert into public users table
  console.log("[User Creation] Creating user profile in public table");
  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.user.id,
    profileId: profileId,
    handle,
    createdAt: new Date().toISOString(),
  });

  if (insertError) {
    console.error("[User Creation] Failed to create user profile:", insertError);
    throw new Error(`Failed to create user profile: ${insertError.message}`);
  }

  console.log("[User Creation] Successfully created new user:", authUser.user.id);
  return authUser.user.id;
}

async function createOrUpdateUser(profileId: string, handle: string) {
  const supabaseClient = await createServiceClient();
  
  const existingUserId = await findExistingUser(supabaseClient, profileId);
  if (existingUserId) {
    return existingUserId;
  }

  return createNewUser(supabaseClient, profileId, handle);
}

async function handleAuthenticatedLogin(refreshToken: string) {
  try {
    console.log("[Auth Login] Initializing Lens client");
    const lens = await getLensClientWithToken(refreshToken);

    console.log("[Auth Login] Fetching user profile from Lens");
    const { profileId, handle } = await getUserProfile(lens);

    if (!profileId || !handle) {
      console.log("[Auth Login] Invalid profile data received", { profileId, handle });
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }
    console.log("[Auth Login] Retrieved profile data", { profileId, handle });

    console.log("[Auth Login] Creating or updating user");
    const userId = await createOrUpdateUser(profileId, handle);

    console.log("[Auth Login] Generating JWT token");
    const token = sign(
      {
        sub: userId,
        role: "authenticated",
        handle: handle,
        profileId: profileId,
      },
      env.SUPABASE_JWT_SECRET,
    );
    console.log("[Auth Login] Authentication successful");

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[Authenticated Login Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 },
    );
  }
}
