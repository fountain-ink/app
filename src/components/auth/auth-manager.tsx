"use client";

import { createClient } from "@/lib/supabase/client";
import { useRefreshToken, useSession } from "@lens-protocol/react-web";
import { setCookie } from "cookies-next";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const generateGuestId = () => `guest_${uuidv4()}`;

export const setupAuthTokens = async (refreshToken?: string | null) => {
  const isLocalhost = window?.location?.hostname === "localhost";
  const domain = isLocalhost ? undefined : ".fountain.ink";

  if (refreshToken) {
    setCookie("refreshToken", refreshToken, {
      domain,
      maxAge: 30 * 24 * 60 * 60,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  try {
    const response = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        refreshToken
          ? { refreshToken }
          : { guestId: generateGuestId() }
      ),
    });

    const { token } = await response.json();
    if (!token) throw new Error("Failed to get token");

    setCookie("appToken", token, {
      domain,
      maxAge: 30 * 24 * 60 * 60,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    const supabase = createClient();
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    return token;
  } catch (error) {
    console.error("Error setting up auth:", error);
    throw error;
  }
};

export const AuthManager = () => {
  const refreshToken = useRefreshToken();
  const { data: session } = useSession();

  useEffect(() => {
    setupAuthTokens(refreshToken).catch(console.error);
    
  }, [refreshToken]);

  return null;
};
