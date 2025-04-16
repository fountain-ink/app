"use client";

import { useDocumentStorage } from "@/hooks/use-document-storage";
import { useQueryClient } from "@tanstack/react-query";

import { EvmAddress } from "@lens-protocol/metadata";
import { toast } from "sonner";
import type { Draft } from "./draft";
import Markdown from "../misc/markdown";
import { LazyAuthorView } from "../user/user-author-view";
import { DraftMenu } from "./draft-menu";

interface DraftViewOptions {
  showDate?: boolean;
  showAuthor?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showPreview?: boolean;
  showContent?: boolean;
}

interface DraftViewProps {
  draft: Draft;
  author?: EvmAddress;
  isLocal: boolean;
  options?: DraftViewOptions;
  isSelected?: boolean;
  onSelect?: () => void;
  onEnterSelectionMode?: () => void;
  isSelectionMode?: boolean;
  onDelete?: () => void;
}

export const DraftView = ({
  draft,
  author,
  isLocal,
  isSelected,
  onSelect,
  onEnterSelectionMode,
  isSelectionMode,
  onDelete,
  options = {
    showAuthor: false,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    showContent: true,
  },
}: DraftViewProps) => {
  const { deleteDocument } = useDocumentStorage();
  const queryClient = useQueryClient();
  const authors = author ? [author] : [];

  const handleDelete = async () => {
    if (isLocal) {
      const { documents } = useDocumentStorage();
      const updatedDocuments = { ...documents };
      delete updatedDocuments[draft.documentId];
      deleteDocument(draft.documentId);
      toast.success("Draft deleted successfully");
    } else {
      try {
        const res = await fetch(`/api/drafts?id=${draft.documentId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          toast.success("Draft deleted successfully");
          queryClient.invalidateQueries({
            queryKey: ["drafts"],
            refetchType: "active",
          });
          onDelete?.();
        } else {
          toast.error("Failed to delete draft");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error deleting draft: ${error.message}`);
        }
      }
    }
  };

  const date = draft.updatedAt ?? draft.createdAt;
  const title = draft.title ?? undefined;
  const subtitle = draft.subtitle ?? undefined;
  const contentMarkdown = draft.contentMarkdown ?? "";
  const coverUrl = draft.coverUrl ?? undefined;

  return (
    <div
      className={`group/draft flex flex-row items-start justify-start gap-4
      ${isSelected ? "bg-primary/10" : "bg-transparent hover:bg-card/50"}
      ${isSelectionMode ? "select-none" : ""}
      hover:text-card-foreground transition-all ease-in duration-100
      border-0 shadow-none relative w-screen rounded-sm p-4
      max-w-full sm:max-w-3xl ${options.showPreview ? "h-48" : "h-fit"}`}
    >
      {options.showPreview && (
        <div className="h-40 w-40 shrink-0 aspect-square rounded-sm overflow-hidden">
          {coverUrl ? (
            <div className="h-full w-full overflow-hidden">
              <img
                src={coverUrl}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover/draft:scale-110"
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
                Last updated {date ? new Date(date).toLocaleString() : ""}
              </span>
            )}
          </div>
          <div className="relative z-10">
            <DraftMenu
              draft={draft}
              onDeleteClick={handleDelete}
              onSelect={onSelect ?? (() => { })}
              isSelected={isSelected}
              onEnterSelectionMode={onEnterSelectionMode}
              isSelectionMode={isSelectionMode}
            />
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
              const href = `/write/${draft.documentId}`;
              window.location.href = href;
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
    </div>
  );
};
