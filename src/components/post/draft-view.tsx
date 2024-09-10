import type { ProfileId } from "@lens-protocol/react-web";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";

interface DraftViewProps {
	draft: { id: string; content_json?: string };
	authorId?: ProfileId;
}

// biome-ignore lint/suspicious/noExplicitAny: intended use
const extractTitle = (content: any): string => {
	try {
		// Check for h1
		const h1Node = content.content.find((node: any) => node.type === "heading");
		if (h1Node) {
			return h1Node.content[0].text;
		}

		// Check for first paragraph
		const firstParagraph = content.content.find(
			(node: any) => node.type === "paragraph",
		);
		if (firstParagraph) {
			return firstParagraph.content[0].text;
		}

		// Check for first sentence
		const firstTextNode = content.content.find(
			(node: any) => node.content?.[0]?.text,
		);
		if (firstTextNode) {
			const sentence = firstTextNode.content[0].text.split(".")[0];
			return sentence.length > 0 ? `${sentence}.` : "Untitled Draft";
		}

		// Default title
		return "Untitled Draft";
	} catch (error) {
		console.error("Error parsing content:", error);
		return "Untitled Draft";
	}
};

export const DraftView = ({ draft, authorId }: DraftViewProps) => {
	const content = draft.content_json || "";
	const title = extractTitle(content);
	const authorIds = authorId ? [authorId] : [];

	return (
		<Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
			<CardHeader>
				{authorId && <UserAuthorView profileIds={authorIds} />}
				<CardTitle className="text-3xl">{title}</CardTitle>
			</CardHeader>
			<CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
				<span>Draft</span>
			</CardFooter>
		</Card>
	);
};
