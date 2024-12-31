"use client";

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

export function AuthManager() {
  const initialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (initialized.current) return;
      initialized.current = true;

      const authToken = document.cookie.includes('appToken');
      if (!authToken) {
        try {
          await setupGuestAuth();
        } catch (error) {
          console.error("Failed to initialize guest auth:", error);
          initialized.current = false;
        }
      }
    };

    initAuth();
  }, []);

  return null;
}
