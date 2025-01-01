import { env } from "@/env";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

const secret = env.SUPABASE_JWT_SECRET;

type DecodedToken = {
  exp?: number;
  [key: string]: unknown;
};

const isValidToken = (token: string | undefined): boolean => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token) as DecodedToken;
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

const verifyToken = (token: string | undefined): boolean => {
  if (!token || !secret) {
    console.error("No token or secret");
    return false;
  }

  try {
    jwt.verify(token, secret);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};

export const getAuthTokens = (): { refreshToken: string | undefined; appToken: string | undefined } => {
  const cookieStorage = cookies();
  let refreshToken = cookieStorage.get("refreshToken")?.value;
  let appToken = cookieStorage.get("appToken")?.value;

  if (refreshToken && !isValidToken(refreshToken)) {
    console.error("Invalid or expired refresh token");
    refreshToken = undefined;
  }

  if (appToken && (!isValidToken(appToken) || !verifyToken(appToken))) {
    console.error("Invalid or expired app token");
    appToken = undefined;
  }

  return {
    refreshToken,
    appToken,
  };
};
