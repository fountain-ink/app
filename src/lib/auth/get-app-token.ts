import { env } from "@/env";
import { cookies } from "next/headers";
import { verifyToken } from "./verify-token";
import { isValidToken } from "./validate-token";

const secret = env.SUPABASE_JWT_SECRET;

export const getAppToken = () => {
  const cookieStorage = cookies();
  let appToken = cookieStorage.get("appToken")?.value;

  if (appToken && (!isValidToken(appToken) || !verifyToken(appToken, secret))) {
    console.error("Invalid or expired app token");
    appToken = undefined;
  }

  return appToken
};
