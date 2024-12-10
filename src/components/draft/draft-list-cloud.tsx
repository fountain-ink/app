"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProfileId } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";
import { Trash, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Draft } from "./draft";
import { DraftView } from "./draft-view";

async function getCloudDrafts() {
  const response = await fetch("/api/drafts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data.drafts;
}

export function CloudDraftsList({ profileId }: { profileId: string | null | undefined }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(true);
    getCloudDrafts()
      .then(setDrafts)
      .finally(() => setIsLoading(false));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    console.log(id);
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const deleteSelectedItems = async () => {
    try {
      const promises = Array.from(selectedItems).map((id) => fetch(`/api/drafts?id=${id}`, { method: "DELETE" }));

      await Promise.all(promises);
      toast.success(`Deleted ${selectedItems.size} drafts`);
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      setDrafts((prev) => prev.filter((draft) => !selectedItems.has(draft.documentId)));
    } catch (error) {
      toast.error("Failed to delete selected drafts");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }
  if (!profileId) {
    return <div>Please login to see your drafts</div>;
  }

  if (!drafts.length) {
    return <div>No drafts available</div>;
  }

  return (
    <div className="relative">
      {selectedItems.size > 0 && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-background/80 backdrop-blur-sm p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedItems.size} selected</Badge>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={deleteSelectedItems}>
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}
      {drafts.map((draft: Draft) => (
        <DraftView
          key={draft.documentId}
          draft={draft}
          authorId={(draft.authorId || profileId) as ProfileId}
          isLocal={false}
          isSelected={selectedItems.has(draft.documentId)}
          onSelect={() => toggleSelection(draft.documentId)}
        />
      ))}
    </div>
  );
}
