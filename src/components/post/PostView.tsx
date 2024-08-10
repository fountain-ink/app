import {
	AnyPublication,
	ArticleMetadataV3,
	Post,
} from "@lens-protocol/react-web";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const PostView = ({ publication }: { publication: Post }) => {
	const metadata = publication.metadata as ArticleMetadataV3;
	if (!metadata) return null;

	return (
		<Card>
			<CardContent>
				<CardHeader>
					<CardTitle>{metadata.title || "Untitled"}</CardTitle>
				</CardHeader>
				{metadata.content}
			</CardContent>
		</Card>
	);
};
