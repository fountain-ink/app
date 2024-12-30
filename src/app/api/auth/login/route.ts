import { getLensClientWithToken } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { Database } from "@/lib/supabase/database";
import { createServiceClient } from "@/lib/supabase/service";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface UserAuthResult {
  userId: string;
  isNewUser: boolean;
}
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

  if (queryError && queryError.code !== "PGRST116") {
    // Ignore not found error
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

  // Update current session with new metadata
  console.log("[User Creation] Updating session metadata");
  const { data: session, error: updateError } = await supabase.auth.updateUser({
    data: {
      profileId,
      handle,
      is_anonymous: false,
    },
  });

  if (updateError) {
    console.error("[User Creation] Failed to update user session:", updateError);
    throw new Error(`Failed to update user session: ${updateError.message}`);
  }

  if (!session?.user) {
    throw new Error("No user found in updated session");
  }

  console.log("[User Creation] Successfully updated user session:", session.user.id);
  return session.user.id;
}

async function handleUserAuthentication(
  supabase: SupabaseClientType,
  profileId: string,
  handle: string,
): Promise<UserAuthResult> {
  // Check if user already exists
  const existingUserId = await findExistingUser(supabase, profileId);

  if (existingUserId) {
    // Update session with existing user's metadata
    const { data: session, error: updateError } = await supabase.auth.admin.updateUserById(existingUserId,
      {
        user_metadata: {
          profileId,
          handle,
        },
        email: `${handle}@fountain.ink`,
    });

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    return { userId: existingUserId, isNewUser: false };
  }

  // Create new user metadata in session
  const newUserId = await createNewUser(supabase, profileId, handle);
  return { userId: newUserId, isNewUser: true };
}

async function handleAuthenticatedLogin(refreshToken: string) {
  try {
    const supabaseClient = await createServiceClient();

    console.log("[Auth Login] Initializing Lens client");
    const lens = await getLensClientWithToken(refreshToken);

    console.log("[Auth Login] Fetching user profile from Lens");
    const { profileId, handle } = await getUserProfile(lens);

    if (!profileId || !handle) {
      console.log("[Auth Login] Invalid profile data received", { profileId, handle });
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }
    console.log("[Auth Login] Retrieved profile data", { profileId, handle });

    console.log("[Auth Login] Processing user authentication");
    const { userId, isNewUser } = await handleUserAuthentication(supabaseClient, profileId, handle);

    console.log("[Auth Login] Generating JWT token");
    // const token = sign(
    //   {
    //     sub: userId,
    //     role: "authenticated",
    //     handle: handle,
    //     profileId: profileId,
    //     is_anonymous: false,
    //   },
    //   env.SUPABASE_JWT_SECRET,
    // );
    console.log("[Auth Login] Authentication successful");

    return NextResponse.json({
      // token,
      isNewUser,
    });
  } catch (error) {
    console.error("[Authenticated Login Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 },
    );
  }
}
