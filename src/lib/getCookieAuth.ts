import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const getCookieAuth = (): { isValid: boolean; refreshToken: string | null } => {
  const storage = cookies();
  const refreshToken = storage.get("refreshToken")?.value;

  if (!refreshToken) {
    return {
      isValid: false,
      refreshToken: null,
    };
  }

  try {
    const decodedToken = jwtDecode(refreshToken);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    if (typeof decodedToken !== 'object' || !('exp' in decodedToken)) {
      throw new Error("Invalid token structure");
    }

    if (typeof decodedToken.exp !== 'number' || decodedToken.exp < currentTimestamp) {
      throw new Error( "Authentication token has expired")
    }

    return {
      isValid: true,
      refreshToken,
    };
  } catch (error) {
    console.log("Error using jwt token:", error);
    return {
      isValid: false,
      refreshToken,
    };
  }
};