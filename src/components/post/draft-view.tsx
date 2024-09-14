"use client";

import { useStorage } from "@/hooks/use-storage";
import { extractTitle } from "@/lib/get-article-title";
import type { ProfileId } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DraftDeleteDialog } from "../navigation/draft-delete-dialog";
import { DraftOptionsDropdown } from "../navigation/draft-options";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";

interface DraftViewProps {
  draft: { document_id: string; content_json?: string };
  authorId?: ProfileId;
  isLocal: boolean;
}

export const DraftView = ({ draft, authorId, isLocal }: DraftViewProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { saveDocument } = useStorage();
  const queryClient = useQueryClient();

  const content = draft.content_json || "";
  const title = extractTitle(content);
  const authorIds = authorId ? [authorId] : [];

  const handleDelete = async () => {
    if (isLocal) {
      const updatedDocuments = { ...useStorage.getState().documents };
      delete updatedDocuments[draft.document_id];
      saveDocument(draft.document_id, updatedDocuments);
      toast.success("Draft deleted successfully");
    } else {
      try {
        const res = await fetch(`/api/drafts?id=${draft.document_id}`, {
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
    <Link href={`/write/${draft.document_id}`}>
      <Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none relative">
        <CardHeader>
          {authorId && <UserAuthorView profileIds={authorIds} />}
          <CardTitle className="text-3xl truncate inline-block w-[calc(100%)] whitespace-nowrap overflow-hidden text-ellipsis ">
            {title}
          </CardTitle>
        </CardHeader>
        <div className="absolute top-2 right-2 ">
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
