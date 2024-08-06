"use client";

import { ConnectKitButton } from "connectkit";

export const UserAvatar = () => {
	return <ConnectKitButton />;
};

import { Types } from "connectkit";

const CustomAvatar = ({ address, ensImage, ensName, size, radius }: Types.CustomAvatarProps) => {
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: radius,
        height: size,
        width: size,
        background: generateColorFromAddress(address), // your function here
      }}
    >
      {ensImage && <img src={ensImage} alt={ensName ?? address} width="100%" height="100%" />}
    </div>
  );
};

export default CustomAvatar;