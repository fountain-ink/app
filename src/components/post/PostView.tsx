import {
	AnyPublication,
	ArticleMetadataV3,
	Post,
} from "@lens-protocol/react-web";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/UserAuthorView";

export const PostView = ({ publication }: { publication: Post }) => {
	const metadata = publication.metadata as ArticleMetadataV3;
	if (!metadata) return null;
  const date = new Date(publication.createdAt);
	const author = publication.by;



	return (
		<Card className="">
				<CardHeader>
					<UserAuthorView profile={author} />	
					<CardTitle className="text-3xl">{metadata.title || "Untitled"}</CardTitle>
				</CardHeader>
			<CardContent>
				{metadata.content}
			</CardContent>
        <CardFooter>
          {date.toDateString()}
        </CardFooter>
		</Card>
	);
};
