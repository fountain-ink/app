import { env } from "@/env";
import { getAuthWithToken } from "@/lib/auth/get-auth-clients";
import { createServiceClient } from "@/lib/supabase/service";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required for authenticated users" },
        { status: 400 }
      );
    }

    return handleAuthenticatedLogin(refreshToken);
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}

async function createOrUpdateUser(profileId: string, handle: string) {
  const supabase = await createServiceClient();
  
  // Try to find existing user
  const { data: existingUser, error: queryError } = await supabase
    .from("users")
    .select("id")
    .eq("lens_profile_id", profileId)
    .single();

  if (queryError && queryError.code !== "PGRST116") { // Ignore not found error
    throw new Error(`Database query failed: ${queryError.message}`);
  }

  if (existingUser?.id) {
    return existingUser.id;
  }

  // Create new auth user
  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email: `${handle}@fountain.ink`,
    user_metadata: {
      profileId,
      handle,
    },
  });

  if (createError) {
    throw new Error(`Failed to create auth user: ${createError.message}`);
  }

  // Insert into public users table
  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.user.id,
    profileId: profileId,
    handle,
    createdAt: new Date().toISOString(),
  });

  if (insertError) {
    throw new Error(`Failed to create user profile: ${insertError.message}`);
  }

  return authUser.user.id;
}

async function handleAuthenticatedLogin(refreshToken: string) {
  try {
    const { profileId, handle } = await getAuthWithToken(refreshToken);

    if (!profileId || !handle) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const userId = await createOrUpdateUser(profileId, handle);

    const token = sign(
      {
        sub: userId,
        role: "authenticated",
        handle: handle,
        lens_profile_id: profileId,
      },
      env.SUPABASE_JWT_SECRET
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[Authenticated Login Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 }
    );
  }
}

