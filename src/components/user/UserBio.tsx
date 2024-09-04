"use client";

import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserBio = ({ profile }: { profile?: ProfileFragment | Profile }) => {
	if (!profile) {
		return null;
	}

	const content = profile?.metadata?.bio;
	return <div className="text-foreground">{content}</div>;
};
