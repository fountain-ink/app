"use client";

import { Profile, SessionType, useSession } from "@lens-protocol/react-web";

export const UserBio = ({
	profile,
}: { profile?: Profile}) => {
	const content = profile?.metadata?.bio;
	return <div className="text-foreground">{content}</div>;
};
