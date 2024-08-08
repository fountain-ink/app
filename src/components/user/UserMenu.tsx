"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { UserAvatar } from "./UserAvatar";
import { ProfileSelect } from "../auth/ProfileSelect";

export const UserMenu = () => {
	const { address, isConnecting, isDisconnected, isConnected } = useAccount();
	const { data } = useSession({ suspense: true });

	if (!isConnected) return <ConnectKitButton />;

	switch (data.type) {
		case SessionType.Anonymous:
      return <ProfileSelect onSuccess={() => {}} />
		case SessionType.JustWallet:
		// data is a WalletOnlySession      return <Onboarding address={data.address} />;
		case SessionType.WithProfile:
			return <UserAvatar />;
	}
};
