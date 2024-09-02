"use client";

import type { ProfileFragment } from "@lens-protocol/client";
import {
    type Profile,
    type ProfileId,
    PublicationMetadataMainFocusType,
    PublicationType,
    usePublications,
} from "@lens-protocol/react-web";
import { toast } from "sonner";
import { PostView } from "../post/PostView";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

export const UserContent = ({
	profile,
	loading,
}: { profile?: Profile | ProfileFragment; loading?: boolean }) => {
	if (loading || !profile) {
		return <ContentSuspense />;
	}


	const {
		data: publications,
		loading: publicationsLoading,
		error,
	} = usePublications({
		where: {
			from: [profile.id as ProfileId],
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
		<Card className="rounded-xl bg-transparent hover:bg-card/50 hover:text-card-foreground group border-0 shadow-none animate-pulse">
			<CardHeader>
				<div className="flex items-center space-x-4">
					<div className="rounded-full bg-muted h-10 w-10" />
					<div className="flex-1 space-y-2 py-1">
						<div className="h-4 bg-muted rounded w-3/4" />
						<div className="h-4 bg-muted rounded w-1/2" />
					</div>
				</div>
				<CardTitle className="text-3xl h-8 bg-muted rounded w-1/2 mt-4" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="h-4 bg-muted rounded" />
					<div className="h-4 bg-muted rounded w-5/6" />
					<div className="h-4 bg-muted rounded w-3/4" />
					<div className="h-4 bg-muted rounded w-2/3" />
				</div>
			</CardContent>
			<CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
				<div className="h-4 bg-muted rounded w-1/4" />
				<div className="h-4 bg-muted rounded w-1/4" />
			</CardFooter>
		</Card>
	);
};
