import { extractMetadata } from "@/lib/get-article-title";
import { formatDate } from "@/lib/utils";
import type { ArticleMetadataV3, Post, ProfileId } from "@lens-protocol/react-web";
import Link from "next/link";
import Markdown from "../content/markdown";
import { UserAuthorView } from "../user/user-author-view";
import { PostReactions } from "./post-reactions";

interface PostViewOptions {
  showDate?: boolean;
  showAuthor?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showPreview?: boolean;
  showContent?: boolean;
}

interface PostViewProps {
  post: Post;
  authorIds: ProfileId[];
  options?: PostViewOptions;
}

export const PostView = ({
  post,
  authorIds,
  options = {
    showAuthor: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    showContent: true,
  },
}: PostViewProps) => {
  const metadata = post.metadata as ArticleMetadataV3;
  const content = metadata?.content.slice(0, 100) || "";
  const formattedDate = formatDate(post.createdAt);
  const handle = post.by?.handle?.localName;
  const contentJson = metadata?.attributes?.find((attr) => attr.key === "contentJson");
  const { title, subtitle, coverImage } = extractMetadata(JSON.parse(contentJson?.value || "{}"));

  return (
    <Link href={`/${handle}/${post.id}`}>
      <div className="flex flex-row items-start justify-start gap-4 bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none relative w-full rounded-sm p-4">
        {options.showPreview && (
          <div className="h-48 w-48 shrink-0 aspect-square rounded-sm overflow-hidden">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-auto relative">
                <div className="placeholder-background rounded-sm" />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          {options.showDate && <span className="text-sm font-[family-name:--date-font] ">{formattedDate}</span>}
          {options.showAuthor && (
            <div>
              <UserAuthorView profileIds={authorIds} />
            </div>
          )}
          {options.showTitle && title && (
            <div className="text-4xl font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-[var(--title-weight)] font-[color:var(--title-color)] line-clamp-2">
              {title}
            </div>
          )}
          {options.showSubtitle && subtitle !== "" && (
            <div className="text-xl font-[family-name:--subtitle-font] text-muted-foreground line-clamp-2">
              {subtitle}
            </div>
          )}
          {options.showContent && (
            <div className="whitespace-normal truncate text-sm line-clamp-3 overflow-auto font-[family-name:--paragraph-font] font-[letter-spacing:var(--paragraph-letter-spacing)] font-[family-name:var(--paragraph-font) font-[var(--paragraph-weight)] font-[color:var(--paragraph-color)]">
              <Markdown
                content={content}
                className="prose prose-sm sm:prose-base lg:prose-lg prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-tight"
              />
            </div>
          )}
          <div className="flex flex-row gap-4 text-sm text-muted-foreground">
            <PostReactions post={post} />
          </div>
        </div>
      </div>
    </Link>
  );
};
