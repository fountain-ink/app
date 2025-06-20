import { sign } from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import { createServiceClient } from "@/lib/db/service";
import { AppToken, TokenClaims } from "./app-token";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21);

export async function signGuestToken(): Promise<AppToken> {
  const guestId = nanoid();
  const username = `guest-${guestId.slice(0, 8)}`;

  const db = await createServiceClient();
  await db.from("users").insert({
    address: guestId,
    handle: username,
    isAnonymous: true,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const claims: TokenClaims = {
    sub: username,
    role: "authenticated",
    metadata: {
      isAnonymous: true,
      isAdmin: false,
      username: username,
      address: guestId,
    },
  };

  return sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });
}
