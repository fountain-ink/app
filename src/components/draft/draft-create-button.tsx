"use client";

import { Button } from "@/components/ui/button";
import { getRandomUid } from "@/lib/get-random-uid";
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

export const DraftCreateButton = ({ text = "Write" }: { text?: string }) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    const documentId = getRandomUid();

    // Optimistically navigate
    router.push(`/write/${documentId}`);

    // Create draft in background
    fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId }),
    }).catch((error) => {
      console.error("Failed to create draft:", error);
      // Could add error handling/toast here
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
