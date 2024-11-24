import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const getTokenFromCookie = (): { isValid: boolean; refreshToken: string | undefined } => {
  const cookieStorage = cookies();
  const refreshToken = cookieStorage.get("refreshToken")?.value;

  if (!refreshToken) {
    return {
      isValid: false,
      refreshToken: undefined,
    };
  }

  try {
    const decodedToken = jwtDecode(refreshToken);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (typeof decodedToken !== "object" || !("exp" in decodedToken)) {
      throw new Error("Invalid token structure");
    }

    if (typeof decodedToken.exp !== "number" || decodedToken.exp < currentTimestamp) {
      throw new Error("Authentication token has expired");
    }

    return {
      isValid: true,
      refreshToken,
    };
  } catch (error) {
    console.error("Error using jwt token:", error);
    return {
      isValid: false,
      refreshToken,
    };
  }
};
