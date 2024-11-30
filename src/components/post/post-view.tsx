import { extractMetadata } from "@/lib/get-article-title";
import { formatDate } from "@/lib/utils";
import type { ArticleMetadataV3, Post, ProfileId } from "@lens-protocol/react-web";
import Link from "next/link";
import Markdown from "../content/markdown";
import { LazyAuthorView } from "../user/user-author-view";
import { PostMenu } from "./post-menu";
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
    <div className="flex flex-row items-start justify-start gap-4 bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none relative w-full rounded-sm p-4 h-48 max-w-[750px]">
      {options.showPreview && (
        <div className="h-40 w-40 shrink-0 aspect-square rounded-sm overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-auto relative">
              <div className="placeholder-background rounded-sm" />
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col w-full h-full justify-between">
        <div className="flex flex-col w-full gap-2">
          {options.showAuthor && (
            <div>
              <LazyAuthorView profileIds={authorIds} />
            </div>
          )}
          {options.showTitle && title && (
            <div className="text-2xl font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-[var(--title-weight)] font-[color:var(--title-color)] line-clamp-2">
              {title}
            </div>
          )}
          {options.showSubtitle && subtitle !== "" && (
            <div className="text-lg font-[family-name:--subtitle-font] text-muted-foreground line-clamp-2">
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
        </div>

        <Link
          href={`/u/${handle}/${post.id}`}
          prefetch
          className="absolute inset-0"
          aria-label={`View post ${title}`}
        />

        <div className={"flex flex-row items-center justify-between text-sm tracking-wide"}>
          <div className="flex flex-row items-center gap-3">
            {options.showDate && <span>{formattedDate}</span>}
            <PostReactions post={post} />
          </div>
          <PostMenu post={post} />
        </div>
      </div>
    </div>
  );
};
