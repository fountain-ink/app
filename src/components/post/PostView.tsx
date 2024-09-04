import type { ArticleMetadataV3, Post, ProfileId } from "@lens-protocol/react-web";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { UserAuthorView } from "../user/UserAuthorView";
import { PostReactions } from "./PostReactions";

interface PostViewProps {
  post: Post | { id: string; title: string; content?: string };
  isDraft?: boolean;
  authorIds?: ProfileId[];
  createdAt?: string;
}

export const PostView = ({ post, isDraft = false, authorIds = [], createdAt }: PostViewProps) => {
  const metadata = 'metadata' in post ? post.metadata as ArticleMetadataV3 : null;
  const title = metadata?.title || post.title || "Untitled";
  const content = metadata?.content || post.content || "";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card className="rounded-xl bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
      <CardHeader>
        {authorIds.length > 0 && <UserAuthorView profileIds={authorIds} />}
        <CardTitle className="text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
        {formattedDate && <span>{formattedDate}</span>}
        {!isDraft && 'stats' in post && <PostReactions post={post} />}
      </CardFooter>
    </Card>
  );
}