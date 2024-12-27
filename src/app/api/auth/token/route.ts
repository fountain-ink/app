import { env } from "@/env";
import { getAuthWithToken } from "@/lib/auth/get-auth-clients";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { refreshToken, guestId } = await req.json();

    if (guestId) {
      const token = sign(
        {
          sub: guestId,
          role: "guest"
        },
        env.SUPABASE_JWT_SECRET
      );
      return NextResponse.json({ token });
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required for authenticated users" },
        { status: 400 }
      );
    }

    // Verify the Lens refresh token and get profile info
    const { profileId, handle } = await getAuthWithToken(refreshToken);

    if (!profileId) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const token = sign(
      {
        sub: profileId,
        role: "authenticated",
        handle: handle,
      },
      env.SUPABASE_JWT_SECRET
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error signing JWT:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}