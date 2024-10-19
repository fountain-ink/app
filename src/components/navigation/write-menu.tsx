"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getRandomUid } from "@/lib/get-random-uid";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "novel";
import { Suspense, useState } from "react";
import { useAccount } from "wagmi";
import { DraftsList } from "../draft/draft-list";
import { LoadingSpinner } from "../loading-spinner";
import { ScrollArea } from "../ui/scroll-area";

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

export const WriteMenu = ({ text = "Write" }: { text?: string }) => {
  const { data: session, loading, error } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected: isWalletConnected } = useAccount();
  const { saveDocument } = useDocumentStorage();
  const router = useRouter();

  if (loading || error) {
    return null;
  }

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

    setIsOpen(false);
    router.refresh();
    router.replace(`/write/${id}`);
  };

  const handleCreate = async () => {
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

    setIsOpen(false);

    router.refresh();
    router.replace(`/write/${draft.documentId}`);
  };

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return <Button onClick={() => handleNew()}>{text}</Button>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{text}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-4">
        <DialogHeader>
          <DialogTitle>Write an article</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<LoadingSpinner className="w-full h-full items-center jusify-center" />}>
          <ScrollArea className="h-96">
            <DraftsList />
          </ScrollArea>
        </Suspense>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={handleCreate} className="flex gap-2">
              <PlusIcon className="h-5 w-5 flex gap-2 text-md" />
              New Article
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
