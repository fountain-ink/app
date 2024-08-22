"use client";

import { env } from "@/env";
import { LensClient, production } from "@lens-protocol/client";
import { type Profile, useLogin } from "@lens-protocol/react-web";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/UserAvatar";
import { serverLogin } from "./ServerLogin";

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

		if (result.isSuccess()) {
			try {
				const refreshToken = await client.authentication.getRefreshToken();
				if (refreshToken.isFailure()) {
					return toast.error(refreshToken.error.message);
				}
				const { jwt } = await serverLogin(refreshToken.value);

				if (!jwt) {
					return toast.error("Failed to login!");
				}

				const supabase: SupabaseClient = createClient(
					env.NEXT_PUBLIC_SUPABASE_URL,
					env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
					{
						global: {
							headers: {
								Authorization: `Bearer ${jwt}`,
							},
						},
					},
				);


			} catch (error) {
				if (error instanceof Error) {
					return toast.error(error?.message);
				}
			}

			return onSuccess(profile);
		}
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
