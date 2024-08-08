"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { UserAvatar } from "./UserAvatar";

export const UserMenu = () => {
	const { address, isConnecting, isDisconnected, isConnected } = useAccount();

  if (!isConnected) return <ConnectKitButton />;

	const profileOrConnector = isConnected ? <ConnectKitButton /> : <UserAvatar />;

  return <div>
    {profileOrConnector}
  </div>
}