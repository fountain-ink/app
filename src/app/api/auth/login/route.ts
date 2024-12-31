import { signAppToken } from "@/lib/auth/sign-app-token";
import { signGuestToken } from "@/lib/auth/sign-guest-token";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("[Login] Starting authentication process");
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      console.log("[Login] Creating guest token");
      const { jwt, handle } = await signGuestToken();
      return NextResponse.json({ jwt, handle }, { status: 200 });
    }

    console.log("[Login] Creating authenticated token");
    const { jwt, profile } = await signAppToken(refreshToken);
    return NextResponse.json({ jwt, handle: profile.handle }, { status: 200 });
  } catch (error) {
    console.error("[Login Route Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 },
    );
  }
}
