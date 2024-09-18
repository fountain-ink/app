"use client";

import { useStorage } from "@/hooks/use-storage";
import { extractTitle } from "@/lib/get-article-title";
import type { ProfileId } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { formatTime } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";
import type { Draft } from "./draft";
import { DraftDeleteDialog } from "./draft-delete-dialog";
import { DraftOptionsDropdown } from "./draft-options";

export const DraftView = ({
  draft,
  authorId,
  isLocal,
}: {
  draft: Draft;
  authorId?: ProfileId;
  isLocal: boolean;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteDocument } = useStorage();
  const queryClient = useQueryClient();

  const content = draft.contentJson;
  const title = extractTitle(content);
  const authorIds = authorId ? [authorId] : [];

  const handleDelete = async () => {
    if (isLocal) {
      const { documents } = useStorage.getState();
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

  const formattedDate = formatTime(draft.updatedAt);

  return (
    <Link href={`/write/${draft.documentId}`}>
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

        <CardFooter className="flex flex-row gap-4 text-sm text-muted-foreground">
          <span>Last modified {formattedDate}</span>
        </CardFooter>

        <DraftDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </Card>
    </Link>
  );
};
