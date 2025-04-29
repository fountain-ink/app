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
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/lib/utils/resolve-image-url";
import { useEffect } from "react";
import { extractSubtitle } from "@/lib/extract-subtitle";

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
  const router = useRouter();

  if (!post || post.metadata.__typename !== "ArticleMetadata") {
    return null;
  }
  const metadata = post.metadata
  const blog = post.feed.group?.metadata
  const blogImage = resolveImageUrl(blog?.icon)
  const subtitleFromAttributes = metadata.attributes?.find((attr) => "key" in attr && attr.key === "subtitle")?.value
  const contentJson = metadata.attributes?.find((attr) => "key" in attr && attr.key === "contentJson")?.value
  const subtitle = subtitleFromAttributes || extractSubtitle(contentJson)

  const username = post.author.username?.localName || "";
  const href = `/p/${username}/${post.slug}`;
  const coverUrl = metadata.attributes?.find((attr) => "key" in attr && attr.key === "coverUrl")?.value

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  if (options.showContent && !("content" in metadata && metadata.content)) {
    return null;
  }

  return (
    <div
      className={`group/post flex flex-row items-start justify-start gap-4 sm:gap-6 md:gap-8 lg:gap-10
      ${isSelected ? "bg-primary/10" : "bg-transparent"}
      ${isSelectionMode ? "select-none" : ""}
      hover:text-card-foreground transition-all ease-in duration-100
      border-0 shadow-none relative w-screen rounded-sm p-4
      max-w-full sm:max-w-3xl h-fit leading-tight`}
    >
      {options.showPreview && (
        <div className="h-40 w-40 shrink-0 aspect-square rounded-sm overflow-hidden">
          {metadata.attributes?.find((attr) => "key" in attr && attr.key === "coverUrl")?.value ? (
            <div className="h-full w-full overflow-hidden relative">
              {coverUrl && (
                <Image
                  src={coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover/post:scale-110"
                  width={256}
                  height={256}
                />
              )}
              <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-in-out bg-white opacity-0 group-hover/post:opacity-20" />
            </div>
          ) : (
            <div className="h-full w-auto relative">
              <div className="placeholder-background rounded-sm">&nbsp;</div>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col w-full h-full min-h-40 gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center w-full z-10 gap-1 font-[family-name:var(--title-font)] tracking-[-0.8px]">
            {options.showAuthor && (
              <AuthorView showUsername={false} accounts={[post.author]} />
            )}
            {options.showBlog && blog && (
              <div className="">
                {options.showAuthor ? (
                  <div className="flex flex-row items-center gap-1">
                    <span className="text-muted-foreground">in</span>
                    <Link prefetch href={`/b/${post.feed.group?.address}`} className="text-foreground gap-1 flex flex-row items-center hover:underline">
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
            <div className="text-[1.75rem]  font-[family-name:var(--title-font)] tracking-[-0.8px] font-medium font-[color:var(--title-color)] line-clamp-2">
              {metadata.title}
            </div>
          )}
          {options.showSubtitle && subtitle && (
            <div className="text-lg mt-2 font-[family-name:--subtitle-font] text-foreground/60 line-clamp-2">
              {subtitle}
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
        </div>

        <div className="flex flex-row items-center justify-between text-sm tracking-wide relative mt-auto">
          <div className="flex flex-row items-center gap-3">
            {options.showDate && (
              <span className="text-foreground/80">
                {formatDate(post.timestamp)}
              </span>
            )}
            <div style={{ position: 'relative', zIndex: 5 }}>
              <PostReactions post={post} />
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 5 }}>
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
            window.getSelection()?.removeAllRanges();
            onEnterSelectionMode?.();
          } else {
            e.preventDefault();
            router.push(href);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch" && e.isPrimary) {
            e.preventDefault();
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
