"use client";

import { Profile, SessionType, useSession } from "@lens-protocol/react-web";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const SessionAvatar = () => {
	const { data: session, loading, error } = useSession();

	if (session?.type !== SessionType.WithProfile) {
		return null;
	}

	return (
		<UserAvatar profile={session?.profile} loading={loading} error={error} />
	);
};

export const UserAvatar = ({
	profile,
	loading,
	error,
	size = 40,
}: { profile?: Profile; loading?: boolean; error?: Error; size?: number }) => {
	if (loading) {
		return <AvatarSuspense />;
	}

	if (error) {
		toast.error(error.message);
		return <AvatarSuspense />;
	}

	const avatar =
		profile?.metadata?.picture?.__typename === "ImageSet"
			? profile?.metadata?.picture?.optimized?.uri ||
			  profile?.metadata?.picture?.raw?.uri
			: profile?.metadata?.picture?.image.optimized?.uri ||
			  profile?.metadata?.picture?.image.raw?.uri;

	return (
		<div style={{ width: size, height: size }}>
			<Avatar className="w-full h-full m-0">
				<AvatarImage src={avatar} />

				<AvatarFallback>
					<AvatarSuspense />
				</AvatarFallback>
			</Avatar>
		</div>
	);
};

export const AvatarSuspense = () => {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-full bg-muted" />
	);
};
