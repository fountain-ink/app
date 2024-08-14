"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { UserAuthorView } from "../user/UserAuthorView";

export const EditorCollaborators = () => {
	const { data: session, loading, error } = useSession();

	if (session?.type !== SessionType.WithProfile) {
		return null;
	}
	if (loading) {
		return null;
	}

	return (
		<div className="flex flex-row gap-4 items-center p-2">
			<UserAuthorView profile={session.profile} />
		</div>
	);
};
