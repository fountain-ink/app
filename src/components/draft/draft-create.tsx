"use client";

import { Button } from "@/components/ui/button";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getRandomUid } from "@/lib/get-random-uid";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "novel";
import { useState } from "react";
import { LoadingSpinner } from "../loading-spinner";

const defaultContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "title",
      attrs: {
        level: 1,
      },
    },
    {
      type: "subtitle",
      attrs: {
        level: 2,
      },
    },
    {
      type: "image",
      attrs: {
        src: null,
        width: "wide",
      },
    },
  ],
};

export const DraftCreate = ({
  onSuccess,
  variant = "default",
  text = "New Article",
  isLocal = false,
}: {
  onSuccess?: () => void;
  variant?: "default" | "ghost";
  text?: string;
  isLocal?: boolean;
}) => {
  const { saveDocument } = useDocumentStorage();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleNew = () => {
    const uid = getRandomUid();
    const id = `local-${uid}`;
    saveDocument(id, {
      id: 0,
      isLocal: true,
      documentId: id,
      authorId: "",
      contentJson: defaultContent,
      updatedAt: "",
      createdAt: "",
    });

    router.refresh();
    router.replace(`/write/${id}`);
    onSuccess?.();
  };

  const handleCreate = async () => {
    setIsCreating(true);
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { draft } = await response.json();
    setIsCreating(false);

    if (!draft) {
      return;
    }

    router.refresh();
    router.replace(`/write/${draft.documentId}`);
    onSuccess?.();
  };

  return isLocal ? (
    <Button onClick={handleNew} variant={variant} className="flex gap-2">
      {text}
    </Button>
  ) : (
    <Button onClick={handleCreate} variant={variant} className="flex items-center jusitfy-center gap-2">
      {isCreating ? (
        <LoadingSpinner size={20} className="w-4 h-4 flex items-center justify-center" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      {text}
    </Button>
  );
};
