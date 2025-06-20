import { cookies } from "next/headers";
import { env } from "@/env";
import { isValidToken } from "./validate-token";
import { verifyToken } from "./verify-token";

const secret = env.SUPABASE_JWT_SECRET;

export const getAppToken = () => {
  const cookieStorage = cookies();
  let appToken = cookieStorage.get("appToken")?.value;

  if (appToken && (!isValidToken(appToken) || !verifyToken(appToken, secret))) {
    console.error("Invalid or expired app token");
    appToken = undefined;
  }

  return appToken;
};
