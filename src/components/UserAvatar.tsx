"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";

export const UserAvatar = () => {
	const { data: session } = useSession({ suspense: true });

	if (session.type !== SessionType.WithProfile) {
		return null;
	}

	const avatar =
		session.profile.metadata?.picture?.__typename === "ImageSet"
			? session.profile?.metadata?.picture?.raw.uri
			: session.profile?.metadata?.picture?.image?.raw.uri;

	return (
		<img
			src={avatar}
			alt={session?.profile?.handle?.localName}
			width="100%"
			height="100%"
		/>
	);
};
