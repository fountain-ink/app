import { TokenClaims } from "./app-token";
import { jwtDecode } from "jwt-decode";

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
