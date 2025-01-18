import { env } from "@/env";
import { cookies } from "next/headers";
import { verifyToken } from "./verify-token";
import { isValidToken } from "./validate-token";

const secret = env.SUPABASE_JWT_SECRET;

export type DecodedToken = {
  exp?: number;
  [key: string]: unknown;
};

export const getAuthTokens = (): { refreshToken: string | undefined; appToken: string | undefined } => {
  const cookieStorage = cookies();
  let refreshToken = cookieStorage.get("refreshToken")?.value;
  let appToken = cookieStorage.get("appToken")?.value;

  if (refreshToken && !isValidToken(refreshToken)) {
    console.error("Invalid or expired refresh token");
    refreshToken = undefined;
  }

  if (appToken && (!isValidToken(appToken) || !verifyToken(appToken, secret))) {
    console.error("Invalid or expired app token");
    appToken = undefined;
  }

  return {
    refreshToken,
    appToken,
  };
};
