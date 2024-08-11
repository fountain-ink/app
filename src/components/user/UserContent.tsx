"use client";

import {
	Profile,
	PublicationMetadataMainFocusType,
	PublicationType,
	usePublications,
} from "@lens-protocol/react-web";
import { toast } from "sonner";
import { PostView } from "../post/PostView";

export const UserContent = ({
	profile,
	loading,
}: { profile?: Profile; loading?: boolean }) => {
	if (loading || !profile) {
		return <ContentSuspense />;
	}

	const {
		data: publications,
		loading: publicationsLoading,
		error,
	} = usePublications({
		where: {
			from: [profile.id],
			metadata: {
				mainContentFocus: [PublicationMetadataMainFocusType.Article],
			},
			publicationTypes: [PublicationType.Post],
		},
	});

	if (publicationsLoading || !publications) {
		return <ContentSuspense />;
	}

	if (error) {
		toast.error(error);
		return null;
	}

	const posts = publications.map((publication) => {
		if (publication.__typename === "Post")
			return <PostView key={publication.id} post={publication} />;
	});

	return <div className="flex flex-col gap-2 p-4">{posts}</div>;
};

export const ContentSuspense = () => {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-full bg-muted" />
	);
};
