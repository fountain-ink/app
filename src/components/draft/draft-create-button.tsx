"use client";
import { getCookie } from "cookies-next";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";

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

export const DraftCreateButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    const profileId = getCookie("profileId") as string;
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { draft } = await response.json();

    if (!draft) {
      return;
    }

    router.refresh();
    router.replace(`/write/${draft.documentId}`);
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
        "Write"
      )}
    </Button>
  );
};
