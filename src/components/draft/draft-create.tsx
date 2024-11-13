"use client";

import { Button } from "@/components/ui/button";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getRandomUid } from "@/lib/get-random-uid";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../loading-spinner";

export const defaultContent: any = [
  {
    type: "h1",
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: "h2",
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: "img",
    width: "wide",
    children: [
      {
        text: "",
      },
    ],
  },
];

type CreateButtonProps = {
  onSuccess?: () => void;
  text?: string;
};

export const NewLocalDraftButton = () => {
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
      contentJson: defaultContent,
      updatedAt: "",
      createdAt: "",
    });
    router.refresh();
    router.replace(`/write/${id}`);
  };

  return (
    <Button onClick={handleNew} variant={"default"} className="flex gap-2">
      Write
    </Button>
  );
};

export const RemoteDraftCreate = () => {
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
  };

  return (
    <Button onClick={handleCreate} variant={"ghost"} className="flex items-center justify-start gap-2 py-1 pl-2 w-full">
      {isCreating ? (
        <LoadingSpinner size={20} className="w-4 h-4 flex items-center justify-center" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      <span>New Article</span>
    </Button>
  );
};
