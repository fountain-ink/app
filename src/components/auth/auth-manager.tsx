"use client";

import { createClient } from "@/lib/supabase/client";
import { setCookie } from "cookies-next";
import { useEffect, useRef } from "react";

export const setupGuestAuth = async () => {
  try {
    const response = await fetch("/api/auth/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!data.token) throw new Error("Failed to authenticate guest");
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
    if (!data) throw new Error("Failed to authenticate user");

    // Store the app token for subsequent requests
    const { appToken } = data;
    if (appToken) {
      setCookie("appToken", appToken, cookieConfig);
    }

  } catch (error) {
    console.error("Error setting up user auth:", error);
    throw error;
  }
};

export function AuthManager() {
  const initialized = useRef(false);

  useEffect(() => {
    const initGuestAuth = async () => {
      if (initialized.current) return;
      initialized.current = true;

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        try {
          await setupGuestAuth();
        } catch (error) {
          console.error("Failed to initialize guest auth:", error);
          initialized.current = false; // Reset flag on error to allow retry
        }
      }
    };

    initGuestAuth();
  }, []);

  return null;
}
