import { extractMetadata } from "@/lib/get-article-title";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { ArticleMetadataV3, Post, ProfileId } from "@lens-protocol/react-web";
import Link from "next/link";
import { useState } from "react";
import Markdown from "../content/markdown";
import type { Draft } from "../draft/draft";
import { DraftDeleteDialog } from "../draft/draft-delete-dialog";
import { DraftOptionsDropdown } from "../draft/draft-options";
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
  authorIds: ProfileId[];
  options?: PostViewOptions;
  isDraft?: boolean;
  onDelete?: () => void;
}

export const PostView = ({
  item,
  authorIds,
  options = {
    showAuthor: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    showContent: true,
  },
  isDraft = false,
  onDelete,
}: PostViewProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  let contentMarkdown: string;
  let date: string;
  let contentJson: string;
  let handle: string;

  if (isDraft) {
    const draft = item as Draft;
    handle = "";
    date = draft.updatedAt;
    contentMarkdown = "";
    contentJson = draft.contentJson;
  } else {
    const post = item as Post;
    const metadata = post?.metadata as ArticleMetadataV3;
    date = post.createdAt;
    handle = post.by?.handle?.localName || "";
    contentMarkdown = metadata?.content.slice(0, 100) || "";
    contentJson = metadata?.attributes?.find((attr) => attr.key === "contentJson")?.value || "{}";
  }
  const { title, subtitle, coverImage } = extractMetadata(isDraft ? contentJson : JSON.parse(contentJson));

  if (options.showContent && !contentMarkdown) {
    return null;
  }

  return (
    <div className="group/post flex flex-row items-start justify-start gap-4 bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 border-0 shadow-none relative w-screen rounded-sm p-4 h-fit max-w-full sm:max-w-2xl">
      {options.showPreview && (
        <div className="h-40 w-40 shrink-0 aspect-square rounded-sm overflow-hidden">
          {coverImage ? (
            <div className="h-full w-full overflow-hidden">
              <img
                src={coverImage}
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
                content={contentMarkdown}
                className="prose prose-sm sm:prose-base lg:prose-lg prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-tight"
              />
            </div>
          )}
        </div>

        <Link
          href={isDraft ? `/write/${(item as Draft).documentId}` : `/u/${handle}/${(item as Post).id}`}
          prefetch
          className="absolute inset-0"
          aria-label={`View ${isDraft ? "draft" : "post"} ${title}`}
        />

        <div className={"flex flex-row items-center justify-between text-sm tracking-wide"}>
          <div className="flex flex-row items-center gap-3">
            {options.showDate && (
              <span className="text-muted-foreground">
                {isDraft ? <>Last updated {formatRelativeTime(date)}</> : formatDate(date)}
              </span>
            )}
            {!isDraft && <PostReactions post={item as Post} />}
          </div>
          {isDraft ? (
            <>
              <DraftOptionsDropdown onDeleteClick={() => setIsDeleteDialogOpen(true)} />
              <DraftDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => onDelete?.()}
              />
            </>
          ) : (
            <PostMenu post={item as Post} />
          )}
        </div>
      </div>
    </div>
  );
};
