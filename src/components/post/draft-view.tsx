import type { ProfileId } from "@lens-protocol/react-web";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";

interface DraftViewProps {
	draft: { id: string; content_json?: string };
	authorId?: ProfileId;
	isCloud: boolean;
}

// biome-ignore lint/suspicious/noExplicitAny: intended use
const extractTitle = (content: any): string => {
	try {
		const firstTextNode = content.content.find(
			(node: any) =>
				node.type === "heading" ||
				node.type === "paragraph" ||
				node.type === "text" ||
				node.content?.[0]?.text,
		);

		if (firstTextNode) {
			if (
				firstTextNode.type === "heading" ||
				firstTextNode.type === "paragraph"
			) {
				return firstTextNode.content[0].text;
			}

			const sentence = firstTextNode.content[0].text.split(".")[0];
			return sentence.length > 0 ? `${sentence}.` : "Untitled Draft";
		}

		return "Untitled Draft";
	} catch (error) {
		console.error("Error parsing content:", error);
		return "Untitled Draft";
	}
};

export const DraftView = ({ draft, authorId, isCloud }: DraftViewProps) => {
	const content = draft.content_json || "";
	const title = extractTitle(content);
	const authorIds = authorId ? [authorId] : [];

	return (
		<Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
			<CardHeader>
				{authorId && <UserAuthorView profileIds={authorIds} />}
				<CardTitle className="text-3xl flex items-center gap-2">
					{title}
				</CardTitle>
			</CardHeader>
			<CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
				<span>Draft</span>
			</CardFooter>
		</Card>
	);
};
