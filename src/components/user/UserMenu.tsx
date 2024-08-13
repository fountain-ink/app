"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { ProfileSelect } from "../auth/ProfileSelect";
import { AvatarSuspense, SessionAvatar } from "./UserAvatar";

export const UserMenu = () => {
	const { data: session, loading, error } = useSession();
	const { isConnected: isWalletConnected } = useAccount();

	if (loading) return <AvatarSuspense />;

	if (error) {
		toast.error(error.message);
		return null;
	}

	if (!isWalletConnected) {
		return <ConnectKitButton />;
	}

	if (session.type !== SessionType.WithProfile) {
		return <ProfileSelect onSuccess={() => {}} />;
	}

	return (
		<Link href={`/u/${session.profile?.handle?.localName}`}>
			<SessionAvatar />
		</Link>
	);
};
