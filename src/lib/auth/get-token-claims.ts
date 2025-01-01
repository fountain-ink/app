import { jwtDecode } from "jwt-decode";

interface AuthClaims {
  sub: string;
  user_metadata: {
    handle?: string;
    isAnonymous?: boolean;
    profileId?: string;
  };
}

export function getTokenClaims(token?: string): AuthClaims | null {
  if (!token) {
    return null;
  }

  try {
    const claims = jwtDecode<AuthClaims>(token);
    return claims;
  } catch (error) {
    console.error("Error decoding auth claims:", error);
    return null;
  }
}
