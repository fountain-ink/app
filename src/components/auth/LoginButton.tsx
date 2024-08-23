"use client";

import { window } from "@/lib/globals";
import { LensClient, production } from "@lens-protocol/client";
import { type Profile, useLogin } from "@lens-protocol/react-web";
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
