import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

interface AuthClaims {
  sub: string;
  user_metadata: {
    handle?: string;
    isAnonymous?: boolean;
    profileId?: string;
  };
}

export function getAuthClaims(): AuthClaims | null {
  const cookieStore = cookies();
  const appToken = cookieStore.get("appToken")?.value;

  if (!appToken) {
    return null;
  }

  try {
    const claims = jwtDecode<AuthClaims>(appToken);
    return claims;
  } catch (error) {
    console.error("Error decoding auth claims:", error);
    return null;
  }
} 