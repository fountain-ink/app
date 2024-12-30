import { getLensClientWithToken } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { Database } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type SupabaseClientType = SupabaseClient<Database>;

interface UserMetadata {
  profileId: string;
  handle: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    console.log("[Login] Starting authentication process");
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      console.log("[Login] Missing refresh token");
      return createErrorResponse("Refresh token is required to login", 400);
    }

    console.log("[Login] Proceeding with authenticated login");
    return await handleAuthenticatedLogin(refreshToken);
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return createErrorResponse("Invalid request format", 400);
  }
}

async function handleAuthenticatedLogin(refreshToken: string) {
  try {
    console.log("[Auth Login] Initializing Lens client");
    const lens = await getLensClientWithToken(refreshToken);

    console.log("[Auth Login] Fetching user profile from Lens");
    const profile = await getUserProfile(lens);

    if (!isValidProfile(profile)) {
      console.log("[Auth Login] Invalid profile data received", profile.handle);
      return createErrorResponse("Invalid refresh token", 401);
    }
    console.log("[Auth Login] Retrieved profile data", profile.handle);

    const supabase = await createClient();
    console.log(profile);
    await syncUserData(supabase, profile);

    const { error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(`Failed to get session: ${sessionError.message}`);
    }

    return NextResponse.json({ result: "Success" }, { status: 200 });
  } catch (error) {
    console.error("[Auth Error]:", error);
    return createErrorResponse(error instanceof Error ? error.message : "Failed to authenticate", 500);
  }
}

async function syncUserData(supabase: SupabaseClientType, profile: { profileId: string; handle: string }) {
  console.log("[User Sync] Starting user data sync", { profile });

  const metadata: UserMetadata = {
    profileId: profile.profileId,
    handle: profile.handle,
    email: `${profile.handle}@fountain.ink`,
  };

  await updateUserSession(supabase, metadata);
  const existingUser = await findExistingUser(supabase, profile.profileId);

  if (existingUser) {
    console.log("[User Sync] Found existing user", { userId: existingUser });
    return existingUser;
  }

  return await createOrUpdateUser(supabase, metadata);
}

async function updateUserSession(supabase: SupabaseClientType, metadata: UserMetadata) {
  console.log("[Session Update] Updating user session metadata");
  const { error } = await supabase.auth.updateUser({
    data: {
      profileId: metadata.profileId,
      handle: metadata.handle,
    },
    email: metadata.email,
  });

  if (error) {
    console.error("[Session Update] Failed to update session:", error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
}

async function findExistingUser(supabase: SupabaseClientType, profileId: string) {
  console.log("[User Lookup] Checking for existing user", { profileId });
  console.log(profileId);
  const { data, error } = await supabase.from("users").select("id").eq("profileId", profileId).single();
  console.log(data);

  if (error && error.code !== "PGRST116") {
    console.error("[User Lookup] Database query failed:", error);
    throw new Error(`Database query failed: ${error.message}`);
  }

  if (data?.id) {
    console.log("[User Lookup] Found existing user:", data.id);
  }
  return data?.id ?? null;
}

async function createOrUpdateUser(supabase: SupabaseClientType, metadata: UserMetadata) {
  console.log("[User Creation] Creating/Updating user", metadata);
  const session = await getCurrentSession(supabase);
  if (!session?.user) {
    throw new Error("No user found in session");
  }

  const userId = session.user.id;
  const userData = {
    handle: metadata.handle,
    profileId: metadata.profileId,
    isAnonymous: false,
    updatedAt: new Date().toISOString(),
  };

  console.log("[User Creation] Attempting to update existing user");
  const { data: updateData, error: updateError } = await supabase
    .from("users")
    .update(userData)
    .eq("id", userId)
    .select()
    .single();

  if (updateData) {
    console.log("[User Creation] Updated existing user:", userId);
    return userId;
  }

  console.log("[User Creation] No existing user found, creating new user");
  const { error: insertError } = await supabase.from("users").insert({
    ...userData,
    id: userId,
    createdAt: new Date().toISOString(),
  });

  if (insertError) {
    console.error("[User Creation] Failed to create user:", insertError);
    throw new Error(`Failed to create user profile: ${insertError.message}`);
  }

  console.log("[User Creation] Successfully created new user:", userId);
  return userId;
}

async function getCurrentSession(supabase: SupabaseClientType) {
  console.log("[Session] Fetching current session");
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("[Session] Failed to get session:", error);
    throw new Error(`Failed to get session: ${error.message}`);
  }

  return session;
}

function isValidProfile(profile: { profileId?: string; handle?: string }): profile is {
  profileId: string;
  handle: string;
} {
  return Boolean(profile.profileId && profile.handle);
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
