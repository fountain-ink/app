import { jwtDecode } from "jwt-decode";

interface AuthClaims {
  sub: string;
  role: string;
  user_metadata: {
    isAnonymous?: boolean;
    handle?: string;
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
