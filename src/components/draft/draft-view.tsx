"use client";

import { useDocumentStorage } from "@/hooks/use-document-storage";
import { extractMetadata } from "@/lib/get-article-title";
import type { ProfileId } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { useState } from "react";
import { toast } from "sonner";
import { PastDateLabel } from "../content/date-label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";
import type { Draft } from "./draft";
import { DraftDeleteDialog } from "./draft-delete-dialog";
import { DraftOptionsDropdown } from "./draft-options";

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
}

export const DraftView = ({
  draft,
  authorId,
  isLocal,
  options = {
    showAuthor: false,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
  },
}: DraftViewProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteDocument } = useDocumentStorage();
  const queryClient = useQueryClient();

  const content = draft.contentJson;

  const { title, subtitle, coverImage } = extractMetadata(content);
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
        });

        if (res.ok) {
          toast.success("Draft deleted successfully");
          queryClient.invalidateQueries({
            queryKey: ["drafts"],
            refetchType: "active",
          });
        } else {
          toast.error("Failed to delete draft");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error deleting draft: ${error.message}`);
        }
      }
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Link href={`/write/${draft.documentId}`} className="flex flex-row items-center justify-center gap-4">
      {options.showPreview && (
        <div className="h-full max-h-40 p-2 w-auto aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <span className="text-muted-foreground">No cover image</span>
          )}
        </div>
      )}
      <Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none relative w-full">
        <CardHeader>
          {options.showDate && <PastDateLabel updatedAt={draft.updatedAt} />}
          {options.showAuthor && authorId && <UserAuthorView profileIds={authorIds} />}
          {options.showTitle && (
            <CardTitle className="text-3xl truncate inline-block w-[calc(100%)] whitespace-nowrap overflow-hidden text-ellipsis">
              {title}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {options.showSubtitle && (
            <CardTitle className="text-xl truncate inline-block w-[calc(100%)] whitespace-nowrap overflow-hidden text-ellipsis">
              {subtitle}
            </CardTitle>
          )}
        </CardContent>
        <div className="absolute top-2 right-2">
          <DraftOptionsDropdown onDeleteClick={() => setIsDeleteDialogOpen(true)} />
        </div>

        <DraftDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </Card>
    </Link>
  );
};
