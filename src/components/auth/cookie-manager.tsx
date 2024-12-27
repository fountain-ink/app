"use client";

import { SessionType, useRefreshToken, useSession } from "@lens-protocol/react-web";
import { getCookie, setCookie } from "cookies-next";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const generateGuestId = () => `guest_${uuidv4()}`;

export const CookieManager = () => {
  const refreshToken = useRefreshToken();
  const { data: session } = useSession();

  useEffect(() => {
    const existingUserId = getCookie("profileId");

    if (!existingUserId) {
      setCookie("profileId", generateGuestId(), {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: "lax",
        path: "/",
      });
    }

    if (session?.type === SessionType.WithProfile) {
      setCookie("profileId", session.profile.id, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: "lax",
        path: "/",
      });
    }
  }, [session]);

  useEffect(() => {
    if (refreshToken) {
      setCookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        path: "/",
      });
    }
  }, [refreshToken]);

  return null;
};
