import { sign } from "jsonwebtoken";
import { customAlphabet } from "nanoid";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21);

export async function signGuestToken() {
  const guestId = nanoid();
  const handle = `guest-${guestId.slice(0, 8)}`;

  const claims = {
    sub: handle,
    role: "authenticated",
    user_metadata: {
      handle,
      isAnonymous: true,
    },
    aud: "authenticated",
  };

  const jwt = sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });

  return { jwt, guestId, handle };
}
