"use client";

import { Button } from "@/components/ui/button";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getRandomUid } from "@/lib/get-random-uid";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../loading-spinner";

const defaultContent: JSON = {
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

type CreateButtonProps = {
  onSuccess?: () => void;
  text?: string;
};

export const LocalDraftCreate = ({ onSuccess, text = "New Article" }: CreateButtonProps) => {
  const { saveDocument } = useDocumentStorage();
  const router = useRouter();

  const handleNew = () => {
    const uid = getRandomUid();
    const id = `local-${uid}`;
    saveDocument(id, {
      id: 0,
      isLocal: true,
      documentId: id,
      authorId: "",
      contentJson: JSON.stringify(defaultContent),
      updatedAt: "",
      createdAt: "",
    });

    router.refresh();
    router.replace(`/write/${id}`);
    onSuccess?.();
  };

  return (
    <Button onClick={handleNew} variant={"default"} className="flex gap-2">
      {text}
    </Button>
  );
};

export const RemoteDraftCreate = ({ onSuccess, text = "New Article" }: CreateButtonProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

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

  return (
    <Button onClick={handleCreate} variant={"ghost"} className="flex items-center justify-start gap-2 py-1 pl-3 w-full">
      {isCreating ? (
        <LoadingSpinner size={20} className="w-4 h-4 flex items-center justify-center" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      <span>{text}</span>
    </Button>
  );
};
