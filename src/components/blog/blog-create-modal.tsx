"use client";

import { feed, group } from "@lens-protocol/metadata";
import { SessionClient, uri } from "@lens-protocol/client";
import { createGroup, fetchGroup } from "@lens-protocol/client/actions";
import { storageClient } from "@/lib/lens/storage-client";
import { useState, useEffect } from "react";
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
import { syncBlogsQuietly } from "./blog-sync-button";
import { useBlogStorage } from "@/hooks/use-blog-storage";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); 
};

export function CreateBlogModal({ open, onOpenChange, onSuccess }: CreateGroupModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  const handleCreateGroup = async () => {
    const sessionClient = await getLensClient();

    if (!sessionClient.isSessionClient()) {
      toast.error("Please login to create a blog");
      return;
    }

    if (!title || !slug) return;

    try {
      setLoading(true);

      const blogMetadata = group({
        name: slug, 
        description: description || "",
      });

      const blogFeedMetadata = feed({
        name: slug, 
        description: description || "",
      });

      const uploadToast = toast.loading("Uploading blog metadata...");
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

      // Fetch the newly created group by transaction hash
      const txHash = result.value;
      const groupResult = await fetchGroup(sessionClient, { txHash });

      if (groupResult.isErr()) {
        console.error("Error fetching blog after creation:", groupResult.error);
        toast.error(`Error fetching blog after creation: ${groupResult.error}`);
      } else {
        const blog = groupResult.value;
        console.log("Fetched blog:", blog);

        if (blog) {
          try {
            const updateToast = toast.loading("Saving blog settings...");
            const response = await fetch(`/api/blogs/${blog.address}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                settings: {
                  title: title,
                  slug: slug,
                  about: description || "",
                }
              }),
            });

            toast.dismiss(updateToast);

            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error saving blog settings:", errorData);
              toast.error(`Error saving blog settings: ${errorData.error || 'Unknown error'}`);
            } else {
              console.log("Blog settings saved successfully");
            }
          } catch (error) {
            console.error("Error saving blog settings:", error);
            toast.error(`Error saving blog settings: ${error}`);
          }
        } else {
          console.error("Blog data is null after creation");
          toast.error("Failed to get blog details after creation");
        }
      }

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
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter blog title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <p className="text-xs text-muted-foreground">
                Used in the blog URL. Must be 1-50 characters, lowercase alphanumeric characters and hyphens only.
              </p>
              <Input
                id="slug"
                placeholder="blog-slug"
                value={slug}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
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
            <Button onClick={handleCreateGroup} disabled={loading || !title || !slug}>
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
  const { setBlogs } = useBlogStorage();

  const handleCreateSuccess = async () => {
    console.log("Syncing blogs after creating a new blog");
    const blogs = await syncBlogsQuietly();
    if (blogs) {
      setBlogs(blogs);
    }

    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        Create Blog
      </Button>

      <CreateBlogModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSuccess={handleCreateSuccess} />
    </>
  );
}
