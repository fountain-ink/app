"use client";

import { feed, group } from "@lens-protocol/metadata";
import { SessionClient, uri } from "@lens-protocol/client";
import { createGroup } from "@lens-protocol/client/actions";
import { storageClient } from "@/lib/lens/storage-client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import { getLensClient } from "@/lib/lens/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBlogModal({ open, onOpenChange, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: walletClient } = useWalletClient();

  const handleCreateGroup = async () => {
    const sessionClient = await getLensClient();

    if (!sessionClient.isSessionClient()) {
      toast.error("Please login to create a blog");
      return;
    }

    if (!name || !description) return;

    try {
      setLoading(true);

      const blogMetadata = group({
        name,
        description,
      });

      const blogFeedMetadata = feed({
        title: name,
        name: name,
        description,
      });

      const uploadToast = toast.loading("Uploading group metadata...");
      const [blogUri, blogFeedUri] = await Promise.all([
        storageClient.uploadAsJson(blogMetadata),
        storageClient.uploadAsJson(blogFeedMetadata),
      ]);
      toast.dismiss(uploadToast);

      console.log("Blog metadata uploaded:", blogUri);
      console.log("Blog feed metadata uploaded:", blogFeedUri);

      const createToast = toast.loading("Creating your blog...");
      
      const result = await createGroup(sessionClient, {
        feed: {
          metadataUri: uri(blogFeedUri.uri),
        },
        metadataUri: uri(blogUri.uri),
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(sessionClient.waitForTransaction);

      toast.dismiss(createToast);

      if (result.isErr()) {
        console.error("Error creating blog:", result.error);
        toast.error(`Error creating blog: ${result.error}`);
        return;
      }

      console.log("Blog created:", result.value);
      toast.success("Blog created successfully!");
      onSuccess();
      onOpenChange(false);

    } catch (err) {
      console.error("Error during blog creation:", err);
      toast.error("Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96 flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Blog</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Blog Name</Label>
              <Input
                id="name"
                placeholder="Enter blog name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter blog description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="mt-auto pt-6 flex justify-end">
            <Button onClick={handleCreateGroup} disabled={loading || !name || !description}>
              {loading ? "Creating..." : "Create Blog"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 

export function CreateBlogButton() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const handleCreateSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Blog
      </Button>

      <CreateBlogModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
} 