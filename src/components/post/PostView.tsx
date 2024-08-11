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

export const PostView = ({ publication }: { publication: Post }) => {
	const metadata = publication.metadata as ArticleMetadataV3;
	if (!metadata) return null;
	const date = new Date(publication.createdAt);
	const author = publication.by;

	return (
		<Card className="rounded-xl bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
			<CardHeader>
				<UserAuthorView profile={author} />
				<CardTitle className="text-3xl">
					{metadata.title || "Untitled"}
				</CardTitle>
			</CardHeader>
			<CardContent>{metadata.content}</CardContent>
			<CardFooter>{date.toDateString()}</CardFooter>
		</Card>
	);
};
