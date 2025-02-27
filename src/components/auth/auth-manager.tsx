"use client";

import { isValidToken } from "@/lib/auth/validate-token";
import { AccessToken, IdToken, RefreshToken } from "@lens-protocol/client";
import { getCookie, setCookie } from "cookies-next";
import { useEffect, useRef } from "react";

const getCookieConfig = () => {
  const isLocalhost = window?.location?.hostname === "localhost";
  return {
    domain: isLocalhost ? undefined : ".fountain.ink",
    maxAge: 30 * 24 * 60 * 60,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  };
};

export const setupGuestAuth = async () => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: null }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!data.jwt) throw new Error("Failed to authenticate guest");

    const cookieConfig = getCookieConfig();

    setCookie("appToken", data.jwt, cookieConfig);

    console.log("[Auth] Set up guest session");

    return data;
  } catch (error) {
    console.error("Error setting up guest auth:", error);
    throw error;
  }
};

export const setupUserAuth = async (refreshToken: string) => {
  try {
    const isLocalhost = window?.location?.hostname === "localhost";
    const cookieConfig = {
      domain: isLocalhost ? undefined : ".fountain.ink",
      maxAge: 30 * 24 * 60 * 60,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    };

    const existingAppToken = getCookie("appToken");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken,
        appToken: existingAppToken,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!data.jwt) throw new Error("Failed to authenticate user");

    setCookie("appToken", data.jwt, cookieConfig);
    console.log("[Auth] Set up user session");

    return data;
  } catch (error) {
    console.error("Error setting up user auth:", error);
    throw error;
  }
};

type Credentials = {
  accessToken: AccessToken;
  idToken: IdToken;
  refreshToken: RefreshToken;
};

export function AuthManager({ credentials }: { credentials: Credentials | null }) {
  const lastRefreshToken = useRef<string | undefined>();
  const isSettingUpAuth = useRef(false);

  const checkAndUpdateAuth = async () => {
    if (isSettingUpAuth.current) return;

    try {
      const currentAppToken = getCookie("appToken");
      // console.log("[Auth] Current app token:", currentAppToken);
      // console.log("[Auth] Credentials:", credentials);

      // Case 1: No credentials and no app token -> setup guest
      if (!credentials && !currentAppToken) {
        isSettingUpAuth.current = true;
        await setupGuestAuth();
        return;
      }

      // Case 2: Has credentials but no app token -> setup user
      if (credentials?.refreshToken && !currentAppToken) {
        isSettingUpAuth.current = true;
        await setupUserAuth(credentials.refreshToken);
        lastRefreshToken.current = credentials.refreshToken;
        return;
      }

      // Case 3: Credentials changed -> setup user again
      // Disabled due to continuous user setup on page refresh
      // if (credentials?.refreshToken && credentials.refreshToken !== lastRefreshToken.current) {
      //   isSettingUpAuth.current = true;
      //   await setupUserAuth(credentials.refreshToken);
      //   lastRefreshToken.current = credentials.refreshToken;
      //   return;
      // }
    } catch (error) {
      console.error("Auth setup failed (This should never happen):", error);
      // window.location.reload(); 
    } finally {
      isSettingUpAuth.current = false;
    }
  };

  useEffect(() => {
    checkAndUpdateAuth();

    const interval = setInterval(checkAndUpdateAuth, 500);
    return () => clearInterval(interval);
  }, []);

  return null;
}
