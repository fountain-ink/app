import { formatDate } from "@/lib/utils";
import type { ArticleMetadataV3, Post, ProfileId } from "@lens-protocol/react-web";
import Link from "next/link";
import Markdown from "../content/markdown";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";
import { PostReactions } from "./post-reactions";

interface PostViewProps {
  post: Post;
  authorIds: ProfileId[];
}

export const PostView = ({ post, authorIds }: PostViewProps) => {
  const metadata = post.metadata as ArticleMetadataV3;
  const content = metadata?.content || "";
  const formattedDate = formatDate(post.createdAt);

  return (
    <Link href={`/p/${post.id}`} prefetch>
      <Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
        <CardHeader className="pb-4">
          <UserAuthorView profileIds={authorIds} />
        </CardHeader>
        <CardContent className="whitespace-break-spaces truncate text-sm line-clamp-3 overflow-auto">
          <Markdown content={content} />
        </CardContent>
        <CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
          <span>{formattedDate}</span>
          <PostReactions post={post} />
        </CardFooter>
      </Card>
    </Link>
  );
};
