import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Account, Post } from "@lens-protocol/client";
import { ArticleMetadata, EvmAddress } from "@lens-protocol/metadata";
import type { Draft } from "../draft/draft";
import { DraftMenu } from "../draft/draft-menu";
import Markdown from "../misc/markdown";
import { AuthorView, LazyAuthorView } from "../user/user-author-view";
import { PostMenu } from "./post-menu";
import { PostReactions } from "./post-reactions";
import Link from "next/link";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/utils/resolve-image-url";

interface PostViewOptions {
  showDate?: boolean;
  showAuthor?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showPreview?: boolean;
  showContent?: boolean;
  showBlog?: boolean;
}

interface PostViewProps {
  post: Post;
  authors: EvmAddress[];
  options?: PostViewOptions;
  isSelected?: boolean;
  onSelect?: () => void;
  onEnterSelectionMode?: () => void;
  isSelectionMode?: boolean;
}

export const PostView = ({
  post,
  authors,
  options = {
    showAuthor: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    showContent: true,
    showBlog: true,
  },
  isSelected = false,
  onSelect,
  onEnterSelectionMode,
  isSelectionMode = false,
}: PostViewProps) => {
  if (!post || post.metadata.__typename !== "ArticleMetadata") {
    return null;
  }
  const metadata = post.metadata
  const blog = post.feed.group?.metadata
  const blogImage = resolveImageUrl(blog?.icon)

  if (options.showContent && !("content" in metadata && metadata.content)) {
    return null;
  }

  return (
    <div
      className={`group/post flex flex-row items-start justify-start gap-4
      ${isSelected ? "bg-primary/10" : "bg-transparent hover:bg-card/50"}
      ${isSelectionMode ? "select-none" : ""}
      hover:text-card-foreground transition-all ease-in duration-100
      border-0 shadow-none relative w-screen rounded-sm p-4
      max-w-full sm:max-w-2xl ${options.showPreview ? "h-48" : "h-fit"}`}
    >
      {options.showPreview && (
        <div className="h-40 w-40 shrink-0 aspect-square rounded-sm overflow-hidden">
          {metadata.attributes?.find((attr) => "key" in attr && attr.key === "coverUrl")?.value ? (
            <div className="h-full w-full overflow-hidden">
              <img
                src={metadata.attributes?.find((attr) => "key" in attr && attr.key === "coverUrl")?.value as string}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover/post:scale-110"
              />
            </div>
          ) : (
            <div className="h-full w-auto relative">
              <div className="placeholder-background rounded-sm">&nbsp;</div>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col w-full h-full justify-between">
        <div className="flex flex-row items-center w-full z-10 gap-1 font-[family-name:var(--title-font)] tracking-[-0.8px]">
          {options.showAuthor && (
            <AuthorView showUsername={false} accounts={[post.author]} />
          )}
          {options.showBlog && blog && (
            <div className="">
              {options.showAuthor ? (
                <div className="flex flex-row items-center gap-1">
                  <span className="text-muted-foreground">in</span>
                  <Link href={`/b/${post.feed.group?.address}`} className="text-foreground gap-1 flex flex-row items-center hover:underline">
                    {/* {blogImage && blogImage !== "" && (
                      <Image src={blogImage} alt={blog.name} width={16} height={16} className="rounded-[4px]" />
                    )} */}
                    {blog.name}
                  </Link>
                </div>
              ) : (
                <span className="text-foreground">{blog.name}</span>
              )}
            </div>
          )}
        </div>
        {options.showTitle && metadata.title && (
          <div className="text-2xl font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] tracking-[-0.8px] font-semibold font-[color:var(--title-color)] line-clamp-2">
            {metadata.title}
          </div>
        )}
        {options.showSubtitle && metadata.attributes?.find((attr) => "key" in attr && attr.key === "subtitle")?.value !== "" && (
          <div className="text-lg font-[family-name:--subtitle-font] text-muted-foreground line-clamp-2">
            {metadata.attributes?.find((attr) => "key" in attr && attr.key === "subtitle")?.value as string}
          </div>
        )}
        {options.showContent && (
          <div className="whitespace-normal truncate text-sm line-clamp-3 overflow-auto font-[family-name:--paragraph-font] font-[letter-spacing:var(--paragraph-letter-spacing)] font-[family-name:var(--paragraph-font) font-[var(--paragraph-weight)] font-[color:var(--paragraph-color)]">
            <Markdown
              content={"content" in metadata ? (metadata.content as string) : ""}
              className="prose prose-sm sm:prose-base lg:prose-lg prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-tight"
            />
          </div>
        )}

        <div className="flex flex-row items-center justify-between text-sm tracking-wide relative z-10">
          <div className="flex flex-row items-center gap-3">
            {options.showDate && (
              <span className="text-muted-foreground">
                {formatDate(post.timestamp)}
              </span>
            )}
            <div className="relative z-10">
              <PostReactions post={post} />
            </div>
          </div>
          <div className="relative z-10">
            <PostMenu post={post} />
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 cursor-pointer z-0"
        onClick={(e) => {
          if (isSelectionMode) {
            onSelect?.();
          } else if (e.shiftKey) {
            e.preventDefault();
            // Prevent text selection
            window.getSelection()?.removeAllRanges();
            onEnterSelectionMode?.();
          } else {
            const username = post.author.username?.localName || "";
            const href = `/p/${username}/${post.slug}`;
            window.location.href = href;
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch" && e.isPrimary) {
            e.preventDefault();
            // Prevent text selection
            window.getSelection()?.removeAllRanges();
            if (isSelectionMode) {
              onSelect?.();
            } else {
              onEnterSelectionMode?.();
            }
          }
        }}
      />
    </div>
  );
};
