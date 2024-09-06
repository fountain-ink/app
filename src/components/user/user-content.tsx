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
import { PostView } from "../post/post-view";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { WriteMenu } from "../write-menu";

export const UserContent = ({
	profile,
	loading,
	contentType = "articles",
}: {
	profile: Profile | ProfileFragment;
	loading?: boolean;
	contentType?: string;
}) => {
	const {
		data: publications,
		loading: publicationsLoading,
		error,
	} = usePublications({
		where: {
			from: [profile.id as ProfileId],
			metadata: {
				mainContentFocus:
					contentType === "articles"
						? [PublicationMetadataMainFocusType.Article]
						: [
								PublicationMetadataMainFocusType.Article,
								PublicationMetadataMainFocusType.Image,
								PublicationMetadataMainFocusType.Audio,
								PublicationMetadataMainFocusType.TextOnly,
								PublicationMetadataMainFocusType.CheckingIn,
								PublicationMetadataMainFocusType.Story,
								PublicationMetadataMainFocusType.Video,
								PublicationMetadataMainFocusType.Embed,
								PublicationMetadataMainFocusType.Link,
							],
			},
			publicationTypes: [PublicationType.Post],
		},
	});

	if (loading || publicationsLoading || !publications) {
		return <ContentSuspense />;
	}

	if (error) {
		toast.error(error);
		return null;
	}

	const posts = publications.map((publication) => {
		if (publication.__typename === "Post")
			return (
				<PostView
					key={publication.id}
					authorIds={[publication.by.id]}
					post={publication}
				/>
			);
	});

	if (posts.length === 0) {
		return (
			<Card className="m-20 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
				<CardHeader>
					<CardTitle>Nobody here but us chickens</CardTitle>
				</CardHeader>
				<CardFooter>
					<WriteMenu text="Start Writing" />
				</CardFooter>
			</Card>
		);
	}

	return <>{posts}</>;
};

export const ContentSuspense = () => {
	return (
		<Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground group border-0 shadow-none animate-pulse">
			<CardHeader>
				<div className="flex items-center space-x-4">
					<div className="rounded-full bg-muted h-10 w-10" />
					<div className="flex-1 space-y-2 py-1">
						<div className="h-4 bg-muted rounded w-3/4" />
					</div>
				</div>
				<CardTitle className="text-3xl h-8 bg-muted rounded w-1/2 mt-4" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="h-4 bg-muted rounded" />
					<div className="h-4 bg-muted rounded w-2/3" />
				</div>
			</CardContent>
			<CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
				<div className="h-4 bg-muted rounded w-1/4" />
			</CardFooter>
		</Card>
	);
};
