import type { ProfileId } from "@lens-protocol/react-web";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { UserAuthorView } from "../user/UserAuthorView";

interface DraftViewProps {
  draft: { id: string; title: string; content?: string };
  authorId?: ProfileId;
}

export const DraftView = ({ draft, authorId }: DraftViewProps) => {
  const title = draft.title || "Untitled Draft";
  const content = draft.content || "";
  const authorIds = authorId ? [authorId] : [];

  return (
    <Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
      <CardHeader>
        {authorId && <UserAuthorView profileIds={authorIds} />}
        <CardTitle className="text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
        <span>Draft</span>
      </CardFooter>
    </Card>
  );
};
