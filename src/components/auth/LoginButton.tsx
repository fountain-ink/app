"use client";

import { env } from "@/env";
import { type Profile, useLogin } from "@lens-protocol/react-web";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/UserAvatar";

const supabase: SupabaseClient = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function LoginButton({
	profile,
	onSuccess,
}: { profile: Profile; onSuccess: (profile: Profile) => void }) {
	const { execute: lensLogin, loading } = useLogin();
	const { address } = useAccount();
	if (!address) {
		return null;
	}

	const login = async () => {
		const result = await lensLogin({
			address,
			profileId: profile.id,
		});

		if (result.isSuccess()) {
			return onSuccess(profile);
		}

		toast.error(result.error.message);
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
