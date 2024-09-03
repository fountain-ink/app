"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { LoadingSpinner } from "../LoadingSpinner";
import { Badge } from "../ui/badge";
import { UserAuthorView } from "../user/UserAuthorView";

export const EditorCollaborators = () => {
	const { data: session, loading, error } = useSession();

	if (session?.type !== SessionType.WithProfile) {
		return (
			<Badge className="mt-0" variant="secondary">
				Login to save changes
			</Badge>
		);
	}
	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="flex flex-row gap-4 items-center p-2">
			<UserAuthorView profile={session.profile} />
		</div>
	);
};
