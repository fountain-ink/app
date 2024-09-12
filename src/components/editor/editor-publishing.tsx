"use client";

import { Button } from "@/components/ui/button";
import { usePublishStore } from "@/hooks/use-publish-store";
import { extractTitle } from "@/lib/get-article-title";
import { uploadMetadata } from "@/lib/upload-utils";
import { article } from "@lens-protocol/metadata";
import { SessionType, useCreatePost, useSession } from "@lens-protocol/react-web";
import { useRouter } from "next/navigation";
import { useEditor } from "novel";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export const EditorPublishing = () => {
  const { data: session } = useSession();
  const { isConnected: isWalletConnected } = useAccount();
  const { isOpen, setIsOpen } = usePublishStore();
  const { execute } = useCreatePost();
  const { editor } = useEditor();
  const router = useRouter();

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return null;
  }

  const handle = session?.profile?.handle?.localName || "";

  const handlePublish = async () => {
    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }

    const content = editor.getJSON();
    const markdown = editor.storage.markdown.getMarkdown();
    const title = extractTitle(content);

    try {
      const metadata = article({
        title,
        content: markdown,
        locale: "en",
        appId: "fountain",
      });

      const metadataURI = await uploadMetadata(metadata, handle);
      const result = await execute({
        metadata: metadataURI,
      });

      if (result.isFailure()) {
        toast.error(`Failed to create post: ${result.error.message}`);
        return;
      }

      const post = await result.value.waitForCompletion();

      toast.success(`Post created successfully! ID: ${post.unwrap().id}`);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An unexpected error occurred while creating the post.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish Article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Are you sure you want to publish this article?</p>
          <Button onClick={handlePublish} className="w-full">
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
