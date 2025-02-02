"use client";

import { LoadingSpinner } from "@/components/misc/loading-spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EvmAddress } from "@lens-protocol/metadata";
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
  console.log(data);
  return data.drafts;
}

export function DraftList({ address }: { address?: EvmAddress | null }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(true);
    getCloudDrafts()
      .then(setDrafts)
      .finally(() => setIsLoading(false));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const enterSelectionMode = useCallback((id: string) => {
    setIsSelectionMode(true);
    setSelectedItems(new Set([id]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  }, []);

  const removeDraft = useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.documentId !== draftId));
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
      console.error(error);
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

  if (!address) {
    return <div>Please login to see your drafts</div>;
  }

  if (!drafts.length) {
    return <div>No drafts available</div>;
  }

  return (
    <div className="relative">
      {selectedItems.size > 0 && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-background/80 backdrop-blur-sm p-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <span className="text-sm">{selectedItems.size} selected</span>
          </div>
          <Button variant="destructive" onClick={deleteSelectedItems}>
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}
      {drafts.map((draft: Draft, index) => (
        <div key={draft.documentId}>
          <DraftView
            draft={draft}
            author={(draft.author || address) as EvmAddress}
            isLocal={false}
            isSelected={selectedItems.has(draft.documentId)}
            onSelect={() => toggleSelection(draft.documentId)}
            onEnterSelectionMode={() => enterSelectionMode(draft.documentId)}
            isSelectionMode={isSelectionMode}
            onDelete={() => removeDraft(draft.documentId)}
          />
          {index < drafts.length - 1 && <Separator className="mx-auto max-w-[92%] my-0.5" />}
        </div>
      ))}
    </div>
  );
}
