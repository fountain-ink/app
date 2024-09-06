import type {
	ArticleMetadataV3,
	Post,
	ProfileId,
} from "@lens-protocol/react-web";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";
import { PostReactions } from "./post-reactions";

interface PostViewProps {
	post: Post;
	authorIds: ProfileId[];
}

export const PostView = ({ post, authorIds }: PostViewProps) => {
	const metadata = post.metadata as ArticleMetadataV3;
	const title = metadata?.title || "Untitled";
	const content = metadata?.content || "";

	const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
			<CardHeader>
				<UserAuthorView profileIds={authorIds} />
				<CardTitle className="text-3xl">{title}</CardTitle>
			</CardHeader>
			<CardContent>{content}</CardContent>
			<CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
				<span>{formattedDate}</span>
				<PostReactions post={post} />
			</CardFooter>
		</Card>
	);
};
