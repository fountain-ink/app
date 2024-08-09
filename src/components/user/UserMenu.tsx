"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { ProfileSelect } from "../auth/ProfileSelect";
import { UserAvatar } from "./UserAvatar";

export const UserMenu = () => {
	const { data, loading, error } = useSession();
	const { address, isConnecting, isDisconnected, isConnected } = useAccount();

	if (loading) return null;
	if (error) return null;

	if (!isConnected) return <ConnectKitButton />;

	switch (data.type) {
		case SessionType.Anonymous:
			return <ProfileSelect onSuccess={() => {}} />;
		case SessionType.JustWallet:
			return <ProfileSelect onSuccess={() => {}} />;
		case SessionType.WithProfile:
			return <UserAvatar />;
	}
};
