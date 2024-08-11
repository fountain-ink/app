import {
	AnyPublication,
	ArticleMetadataV3,
	Post,
} from "@lens-protocol/react-web";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { UserAuthorView } from "../user/UserAuthorView";
import { PostReactions } from "./PostReactions";

export const PostView = ({ post }: { post: Post }) => {
	const metadata = post.metadata as ArticleMetadataV3;
	if (!metadata) return null;
	const date = new Date(post.createdAt);
	const formattedDate = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	const author = post.by;

	return (
		<Card className="rounded-xl bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
			<CardHeader>
				<UserAuthorView profile={author} />
				<CardTitle className="text-3xl">
					{metadata.title || "Untitled"}
				</CardTitle>
			</CardHeader>
			<CardContent>{metadata.content}</CardContent>
			<CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
				{formattedDate}
				<PostReactions post={post} />
			</CardFooter>
		</Card>
	);
};
