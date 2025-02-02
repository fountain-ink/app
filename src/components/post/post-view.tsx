import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Post } from "@lens-protocol/client";
import { ArticleMetadata, EvmAddress } from "@lens-protocol/metadata";
import type { Draft } from "../draft/draft";
import { DraftMenu } from "../draft/draft-menu";
import Markdown from "../misc/markdown";
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
  item: Post | Draft;
  authors: EvmAddress[];
  options?: PostViewOptions;
  isDraft?: boolean;
  onDelete?: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onEnterSelectionMode?: () => void;
  isSelectionMode?: boolean;
}

export const PostView = ({
  item,
  authors,
  options = {
    showAuthor: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    showContent: true,
  },
  isSelected = false,
  onSelect,
  onEnterSelectionMode,
  isSelectionMode = false,
  isDraft = false,
  onDelete,
}: PostViewProps) => {
  let contentMarkdown: string;
  let date: string;
  let contentJson: string;
  let username: string;
  let title: string | undefined;
  let subtitle: string | undefined;
  let coverUrl: string | undefined;

  if (isDraft) {
    const draft = item as Draft;
    username = "";
    date = draft.updatedAt ?? draft.createdAt;
    const content = draft.contentJson ? draft.contentJson : {};
    title = draft.title ?? undefined;
    subtitle = draft.subtitle ?? undefined;
    contentMarkdown = draft.contentHtml ?? "";
    coverUrl = draft.coverUrl ?? undefined;
    contentJson = String(draft.contentJson ?? "{}");
  } else {
    const post = item as Post;
    const metadata = post?.metadata as ArticleMetadata;
    date = post.timestamp;
    title = "title" in metadata ? (metadata.title as string) : undefined;
    subtitle =
      (metadata.attributes?.find((attr) => "key" in attr && attr.key === "subtitle")?.value as string) ?? undefined;
    username = post.author.username?.localName || "";
    contentMarkdown = "content" in metadata ? (metadata.content as string) : "";
    coverUrl = metadata.attributes?.find((attr) => "key" in attr && attr.key === "coverUrl")?.value as string;
    contentJson =
      (metadata?.attributes?.find((attr) => "key" in attr && attr.key === "contentJson")?.value as string) || "{}";
  }

  if (options.showContent && !contentMarkdown) {
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
          {coverUrl ? (
            <div className="h-full w-full overflow-hidden">
              <img
                src={coverUrl}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover/post:scale-110"
              />
            </div>
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
              <LazyAuthorView authors={authors} />
            </div>
          )}
          {options.showTitle && title && (
            <div className="text-2xl font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] tracking-[-0.8px]  font-semibold font-[color:var(--title-color)] line-clamp-2">
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
                content={contentMarkdown}
                className="prose prose-sm sm:prose-base lg:prose-lg prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-tight"
              />
            </div>
          )}
        </div>

        <div className="flex flex-row items-center justify-between text-sm tracking-wide relative z-10">
          <div className="flex flex-row items-center gap-3">
            {options.showDate && (
              <span className="text-muted-foreground">
                {isDraft ? <>Last updated {formatRelativeTime(date)}</> : formatDate(date)}
              </span>
            )}
            {!isDraft && (
              <div className="relative z-10">
                <PostReactions post={item as Post} />
              </div>
            )}
          </div>
          <div className="relative z-10">
            {isDraft ? (
              <>
                <DraftMenu
                  draft={item as Draft}
                  onDeleteClick={onDelete ?? (() => {})}
                  onSelect={onSelect ?? (() => {})}
                  isSelected={isSelected}
                  onEnterSelectionMode={onEnterSelectionMode}
                  isSelectionMode={isSelectionMode}
                />
              </>
            ) : (
              <PostMenu post={item as Post} />
            )}
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
              const href = isDraft ? `/write/${(item as Draft).documentId}` : `/p/${username}/${(item as Post).slug}`;
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
    </div>
  );
};
