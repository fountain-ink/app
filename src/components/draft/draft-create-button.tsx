"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { toast } from "sonner";
import { createDraft } from "@/lib/plate/create-draft";

export const DraftCreateButton = ({
  text = "Write",
  initialContent
}: {
  text?: string;
  initialContent?: any;
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    try {
      setIsCreating(true);

      const { documentId } = await createDraft({
        initialContent
      });

      router.push(`/write/${documentId}`);
    } catch (error) {
      console.error("Failed to create draft:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create draft");
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      variant={isCreating ? "ghost" : "default"}
      className="flex items-center justify-center gap-2 grow-0 text-sm"
    >
      {isCreating ? (
        <div className="w-8 h-8 flex items-center justify-center">
          <LoadingSpinner size={20} className="w-4 h-4 flex items-center justify-center" />
        </div>
      ) : (
        text
      )}
    </Button>
  );
};
