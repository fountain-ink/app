"use client";

import { window } from "@/lib/globals";
import { LensClient, production } from "@lens-protocol/client";
import { type Profile, useLogin } from "@lens-protocol/react-web";
import { setCookie } from "cookies-next";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/UserAvatar";

export function LoginButton({
	profile,
	onSuccess,
}: { profile: Profile; onSuccess: (profile: Profile) => void }) {
	const { execute: lensLogin, loading } = useLogin();
	const { address } = useAccount();

	if (!address) {
		return null;
	}

	const client = new LensClient({
		environment: production,
		storage: window?.localStorage,
	});

	const login = async () => {
		const result = await lensLogin({
			address,
			profileId: profile.id,
		});

		if (result.isFailure()) {
			return toast.error(result.error.message);
		}

		// set a cookie from the local storage with the refresh token
		const credentials = localStorage.getItem("lens.production.credentials");
		if (!credentials) {
			return toast.error("Failed to get credentials");
		}

		const refreshToken = JSON.parse(credentials)?.data?.refreshToken;

		if (refreshToken) {
			const isLocalhost = window?.location?.hostname === "localhost";
			const domain = isLocalhost ? undefined : ".fountain.ink";
			setCookie("refreshToken", refreshToken, {
				domain,
				secure: true,
				sameSite: "lax",
				path: "/",
			});
		}

		return onSuccess(profile);
	};

	return (
		<Button
			variant="ghost"
			className="flex items-center justify-center gap-2 text-md"
			disabled={loading}
			onClick={login}
		>
			<UserAvatar profile={profile} className="w-8 h-8" />
			{profile.handle?.localName ?? profile.id}
		</Button>
	);
}
