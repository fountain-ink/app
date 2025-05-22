import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { getTokenClaims } from "./get-token-claims";
import { verifyToken } from "./verify-token";

export function verifyAuth(req: NextRequest) {
  const token = req.cookies.get("appToken")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const verified = verifyToken(token, env.SUPABASE_JWT_SECRET);
  if (!verified) {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  const claims = getTokenClaims(token);
  if (!claims || !claims.metadata?.address) {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  return { claims };
}
