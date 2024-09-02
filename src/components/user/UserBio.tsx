"use client";

import { Profile, ProfileFragment } from "@lens-protocol/react-web";

export const UserBio = ({
	profile,
}: { profile?: Profile | ProfileFragment }) => {
	const content = profile?.metadata?.bio;
	return <div className="text-foreground">{content}</div>;
};
