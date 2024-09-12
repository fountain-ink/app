"use client";

import { useStorage } from "@/hooks/use-storage";
import {
	type ProfileId,
	SessionType,
	useSession,
} from "@lens-protocol/react-web";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../loading-spinner";
import { DraftView } from "../post/draft-view";

const fetchCloudDrafts = async () => {
	const response = await fetch("/api/drafts", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	return data.drafts;
};

type Draft = {
	id: string;
	content_json?: string;
	author_id?: ProfileId;
	isLocal: boolean;
};

export const DraftsList = () => {
	const { data: session, loading: sessionLoading } = useSession();
	const { documents: localDrafts } = useStorage();

	const {
		data: cloudDrafts,
		isLoading: cloudDraftsLoading,
		error: cloudDraftsError,
	} = useQuery({
		queryKey: ["drafts"],
		queryFn: fetchCloudDrafts,
	});

	if (sessionLoading) return <LoadingSpinner />;
	if (session?.type !== SessionType.WithProfile) return null;
	if (cloudDraftsError)
		return <div>Error loading drafts: {cloudDraftsError.message}</div>;

	const cloudDraftsList =
		cloudDrafts?.map((draft: Draft) => ({ ...draft, isLocal: false })) || [];
	const localDraftsList = Object.entries(localDrafts).map(([id, content]) => ({
		id,
		content_json: content as unknown as string,
		isLocal: true,
	}));

	const allDrafts = [...cloudDraftsList, ...localDraftsList];
	const profileId = session?.profile.id;

	return (
		<div className="space-y-4">
			{cloudDraftsLoading ? (
				<LoadingSpinner />
			) : allDrafts.length === 0 ? (
				<div>No drafts available</div>
			) : (
				allDrafts.map((draft) => (
					<DraftView
						key={draft.id}
						draft={draft}
						authorId={draft.author_id || profileId}
						isLocal={draft.isLocal}
					/>
				))
			)}
		</div>
	);
};
