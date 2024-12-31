"use client";

import { useDocumentStorage } from "@/hooks/use-document-storage";
import type { ProfileId } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { PostView } from "../post/post-view";
import type { Draft } from "./draft";

interface DraftViewOptions {
  showDate?: boolean;
  showAuthor?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showPreview?: boolean;
}

interface DraftViewProps {
  draft: Draft;
  authorId?: ProfileId;
  isLocal: boolean;
  options?: DraftViewOptions;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const DraftView = ({
  draft,
  authorId,
  isLocal,
  isSelected,
  onSelect,
  onDelete,
  options = {
    showAuthor: false,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
  },
}: DraftViewProps) => {
  const { deleteDocument } = useDocumentStorage();
  const queryClient = useQueryClient();
  const authorIds = authorId ? [authorId] : [];

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

  return (
    <PostView
      item={draft}
      authorIds={authorIds}
      options={options}
      isDraft={true}
      onDelete={handleDelete}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
};
