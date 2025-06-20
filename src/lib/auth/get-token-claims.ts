import { jwtDecode } from "jwt-decode";
import { TokenClaims } from "./app-token";

export function getTokenClaims(token?: string): TokenClaims | null {
  if (!token) {
    return null;
  }

  try {
    const claims = jwtDecode<TokenClaims>(token);
    return claims;
  } catch (error) {
    console.error("Error decoding auth claims:", error);
    return null;
  }
}
