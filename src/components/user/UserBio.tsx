"use client";

import type { ProfileFragment } from "@lens-protocol/client";

export const UserBio = ({ profile }: { profile?: ProfileFragment }) => {
	if (!profile) {
		return null;
	}

	const content = profile?.metadata?.bio;
	return <div className="text-foreground">{content}</div>;
};
