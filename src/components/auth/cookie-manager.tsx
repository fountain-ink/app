"use client";

import { useRefreshToken } from "@lens-protocol/react-web";
import { setCookie } from "cookies-next";
import { useEffect } from "react";

export const CookieManager = () => {
	const refreshToken = useRefreshToken();

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
