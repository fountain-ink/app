"use client";

import { UserAvatar } from "@/components/user/UserAvatar";
import { useProfile } from "@lens-protocol/react-web";
import { UserBio } from "./UserBio";
import { UserSocials } from "./UserSocials";
import { toast } from "sonner";

export const UserProfile = ({ user }: { user: string }) => {
	const handle = `lens/${user}`;
	const { data: profile, loading, error } = useProfile({ forHandle: handle });

	if (loading) {
		return <UserSuspense />;
	}

	if (error) {
		toast.error(error.message);
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			<UserAvatar profile={profile} />
			<UserBio profile={profile} />
			<UserSocials profile={profile} />
		</div>
	);
};

const UserSuspense = () => {
	return (
		<div className="flex h-4 w-96 items-center justify-center rounded-full bg-muted" />
	);
};