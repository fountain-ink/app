"use client";

import { Button } from "@/components/ui/button";
import { getRandomUid } from "@/lib/get-random-uid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { TITLE_KEYS } from "@/components/editor/plugins/title-plugin";
import { toast } from "sonner";
import { ParagraphPlugin } from "@udecode/plate-core/react";

export const defualtGuestContent: any = [
  {
    type: TITLE_KEYS.title,
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: TITLE_KEYS.subtitle,
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
  {
    id: "guest-paragraph",
    type: ParagraphPlugin.key,
    children: [
      {
        text: "Welcome to Fountain! When you want to save the draft or publish your article, login to continue. Enjoy!",
      },
    ],
  },
];

export const defaultContent: any = [
  {
    type: TITLE_KEYS.title,
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: TITLE_KEYS.subtitle,
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

export const DraftCreateButton = ({ text = "Write" }: { text?: string }) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    const documentId = getRandomUid();

    router.push(`/write/${documentId}`);

    fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId }),
    }).catch((error) => {
      console.error("Failed to create draft:", error);
      toast.error("Failed to create draft");
    });
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
