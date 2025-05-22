import { NextRequest, NextResponse } from "next/server";
import { getTokenClaims } from "./get-token-claims";
import { isAdmin } from "./is-admin";
import { verifyToken } from "./verify-token";
import { env } from "@/env";

/**
 * Middleware to ensure the user is authenticated and has admin access
 * @param req NextRequest object
 * @returns Response or null if authenticated
 */
export async function checkAdminRights(req: NextRequest) {
  try {
    const appToken = req.cookies.get("appToken")?.value;

    if (!appToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isValid = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);

    if (!isAdmin(claims?.sub)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return null;
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}
