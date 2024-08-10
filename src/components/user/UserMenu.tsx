"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { toast } from "sonner";
import { ProfileSelect } from "../auth/ProfileSelect";
import { AvatarSuspense, SessionAvatar } from "./UserAvatar";

export const UserMenu = () => {
	const { data, loading, error } = useSession();

	if (loading) return <AvatarSuspense />;

	if (error) {
		toast.error(error.message);
		return null;
	}

	switch (data.type) {
		case SessionType.Anonymous:
			return <ConnectKitButton />;
		case SessionType.JustWallet:
			return <ProfileSelect onSuccess={() => {}} />;
		case SessionType.WithProfile:
			return (
				<Link href={`/u/${data.profile?.handle?.localName}`}>
					<SessionAvatar />
				</Link>
			);
	}
};
