"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { Suspense } from "react";

const Avatar = () => {
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

export const UserAvatar = () => {
	return (
		<Suspense fallback={null}>
			<Avatar />
		</Suspense>
	);
};
