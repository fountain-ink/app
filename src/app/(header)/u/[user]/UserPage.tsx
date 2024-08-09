"use client";

import { ProfileAvatar } from "@/components/user/UserAvatar";
import { useProfile } from "@lens-protocol/react-web";

export const UserPage = ({ params }: { params: { user: string } }) => {
	const handle = `lens/${params.user}`;
	const { data: profile, loading, error } = useProfile({ forHandle: handle });

	return <ProfileAvatar profile={profile} loading={loading} error={error} />;
};
