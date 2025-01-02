"use client";

import { isValidToken } from "@/lib/auth/validate-auth-token";
import { useRefreshToken } from "@lens-protocol/react-web";
import { setCookie } from "cookies-next";
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
    });

    const data = await response.json();
    if (!data.jwt) throw new Error("Failed to authenticate guest");

    const cookieConfig = getCookieConfig();

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
  const refreshToken = useRefreshToken();

  const checkAndUpdateAuth = async () => {
    try {
      const currentRefreshToken = getCookie("refreshToken");
      const currentAppToken = getCookie("appToken");

      if (currentRefreshToken !== lastRefreshToken.current) {
        lastRefreshToken.current = currentRefreshToken;
      }
      if (currentAppToken !== lastAppToken.current) {
        lastAppToken.current = currentAppToken;
      }

      if (currentRefreshToken && isValidToken(currentRefreshToken)) {
        if (!currentAppToken || !isValidToken(currentAppToken)) {
          console.log("[Auth] App token missing or invalid");
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
    if (refreshToken) {
      setCookie("refreshToken", refreshToken, getCookieConfig());
    }
  }, [refreshToken]);

  useEffect(() => {
    checkAndUpdateAuth();

    const interval = setInterval(checkAndUpdateAuth, 500);

    return () => clearInterval(interval);
  }, []);

  return null;
}
