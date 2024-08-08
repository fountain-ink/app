"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { UserAvatar } from "./UserAvatar";

export const UserMenu = () => {
	const { address, isConnecting, isDisconnected } = useAccount();

	const profileOrConnector = isDisconnected ? <ConnectKitButton /> : <UserAvatar />;

  return <div>
    {profileOrConnector}
  </div>
}