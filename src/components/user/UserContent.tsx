"use client";

import { Profile, usePublications } from "@lens-protocol/react-web";
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
	} = usePublications({ where: { from: [profile.id] } });

	if (publicationsLoading || !publications) {
		return <ContentSuspense />;
	}

	if (error) {
		toast.error(error);
		return null;
	}

	const posts = publications.map((publication) => (
		<PostView key={publication.id} publication={publication} />
	));

	return <div className="flex flex-col gap-2">{posts}</div>;
};

export const ContentSuspense = () => {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-full bg-muted" />
	);
};
