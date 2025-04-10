import { getCookie } from "cookies-next";
import { getTokenClaims } from "./get-token-claims";

/**
 * Checks if the current user is a guest based on their token
 * @returns True if user is a guest, false otherwise
 */
export function isGuestUser(): boolean {
  const appToken = getCookie("appToken");
  if (!appToken) return false;

  const claims = getTokenClaims(appToken);
  return claims?.metadata?.isAnonymous === true;
}