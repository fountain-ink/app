"use client";

import { uploadMetadata } from "@/lib/upload-utils";
import { article } from "@lens-protocol/metadata";
import { useCreatePost } from "@lens-protocol/react-web";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { extractTitle } from "@/lib/get-article-title";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export const PublishMenu = ({ content }: { content: string }) => {
  const { data: session, loading, error } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected: isWalletConnected } = useAccount();
  const router = useRouter();
  const { execute } = useCreatePost();
  const title = extractTitle(content);

  if (loading || error) {
    return null;
  }

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return null;
  }

  const handle = session?.profile?.handle?.localName || "";

  const handlePublish = async () => {
    try {
      // Create metadata
      const metadata = article({
        title,
        content,
        locale: "en",
        appId: "fountain",
      });

      // Upload metadata to IPFS
      const metadataURI = await uploadMetadata(metadata, handle);

      // Create post using Lens SDK
      const result = await execute({
        metadata: metadataURI,
      });

      if (result.isFailure()) {
        toast.error(`Failed to create post: ${result.error.message}`);
        return;
      }

      const post = await result.value.waitForCompletion();

      setIsOpen(false);
      toast.success(`Post created successfully! ID: ${post.unwrap().id}`);

      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An unexpected error occurred while creating the post.");
    }
  };

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return <Button onClick={() => toast.info("Login to publish")}>Publish</Button>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Publish</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish an Article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handlePublish} variant="ghost" className="w-full justify-start flex gap-2 p-2">
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
