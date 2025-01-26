import { jwtDecode } from "jwt-decode";

export const isValidToken = (token: string | undefined): boolean => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (typeof decodedToken !== "object" || !("exp" in decodedToken)) {
      return false;
    }

    if (typeof decodedToken.exp !== "number" || decodedToken.exp < currentTimestamp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
