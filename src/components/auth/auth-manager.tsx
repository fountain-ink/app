"use client";

import { isValidToken } from "@/lib/auth/validate-auth-token";
import { setCookie } from "cookies-next";
import { useEffect, useRef } from "react";

export const setupGuestAuth = async () => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: null }),
    });

    const data = await response.json();
    if (!data.jwt) throw new Error("Failed to authenticate guest");

    const isLocalhost = window?.location?.hostname === "localhost";
    const cookieConfig = {
      domain: isLocalhost ? undefined : ".fountain.ink",
      maxAge: 30 * 24 * 60 * 60,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    };

    setCookie("appToken", data.jwt, cookieConfig);
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

    setCookie("refreshToken", refreshToken, cookieConfig);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!data.jwt) throw new Error("Failed to authenticate user");

    setCookie("appToken", data.jwt, cookieConfig);
    return data;
  } catch (error) {
    console.error("Error setting up user auth:", error);
    throw error;
  }
};

const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
};

export function AuthManager() {
  const lastRefreshToken = useRef<string | undefined>();
  const lastAppToken = useRef<string | undefined>();

  const checkAndUpdateAuth = async () => {
    try {
      const currentRefreshToken = getCookie("refreshToken");
      const currentAppToken = getCookie("appToken");

      const refreshTokenChanged = currentRefreshToken !== lastRefreshToken.current;
      const appTokenChanged = currentAppToken !== lastAppToken.current;

      if (!refreshTokenChanged && !appTokenChanged) {
        return;
      }

      lastRefreshToken.current = currentRefreshToken;
      lastAppToken.current = currentAppToken;

      if (currentRefreshToken && isValidToken(currentRefreshToken)) {
        if (!currentAppToken || !isValidToken(currentAppToken) || appTokenChanged) {
          console.log("[Auth] Token changed or invalid");
          await setupUserAuth(currentRefreshToken);
          console.log("[Auth] Set up user session");
        }
      } else if (!currentAppToken || !isValidToken(currentAppToken)) {
        console.log("[Auth] App token missing or invalid");
        await setupGuestAuth();
        console.log("[Auth] Set up guest session");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  useEffect(() => {
    checkAndUpdateAuth();

    const interval = setInterval(checkAndUpdateAuth, 500);

    return () => clearInterval(interval);
  }, []);

  return null;
}
