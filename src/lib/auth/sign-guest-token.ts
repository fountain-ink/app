import { createServiceClient } from "@/lib/supabase/service";
import { sign } from "jsonwebtoken";
import { customAlphabet } from "nanoid";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21);

export async function signGuestToken() {
  const guestId = nanoid();
  const handle = `guest-${guestId.slice(0, 8)}`;

  const db = await createServiceClient();
  await db.from("users").insert({
    profileId: guestId,
    handle,
    isAnonymous: true,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const claims = {
    sub: handle,
    role: "authenticated",
    user_metadata: {
      isAnonymous: true,
      handle,
      profileId: guestId,
    },
  };

  const jwt = sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });

  return { jwt, guestId, handle };
}
