"use client";

import { SessionType, useProfile, useSession } from "@lens-protocol/react-web";
import { toast } from "sonner";

export const UserCover = ({ user }: { user: string }) => {
	const handle = `lens/${user}`;
	const { data: profile, loading, error } = useProfile({ forHandle: handle });

	if (loading) {
		return <UserCoverSuspense />;
	}

	if (error) {
		toast.error(error.message);
		return null;
	}

	const cover =
		profile?.metadata?.coverPicture?.optimized ||
		profile?.metadata?.coverPicture?.raw;

	if (!cover) {
		return <div className="w-full h-48 bg-muted" />;
	}

	return (
		<img
			className="rounded-b-lg"
			src={cover.uri}
			alt={profile?.handle?.localName}
		/>
	);
};

const UserCoverSuspense = () => {
	return <div className="w-full h-48 bg-muted" />;
};
