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
import { useAuthenticatedUser } from "@lens-protocol/react";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
};

const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]{1,50}$/;
  return slugRegex.test(slug);
};

export function CreateBlogModal({ open, onOpenChange, onSuccess }: CreateGroupModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { data: user } = useAuthenticatedUser();

  const slugIsValid = slug === "" || isValidSlug(slug);

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
    if (!isValidSlug(slug)) {
      toast.error("Invalid slug format");
      return;
    }

    if (!user || !user.address) {
      toast.error("Please login to create a blog");
      return;
    }

    setLoading(true);
    let blogAddress = null;

    try {
      const blogMetadata = group({
        name: slug,
        description: description || undefined,
      });

      const blogFeedMetadata = feed({
        name: slug,
        description: description || undefined,
      });

      const uploadToast = toast.loading("Uploading blog metadata...");
      const [blogUri, blogFeedUri] = await Promise.all([
        storageClient.uploadAsJson(blogMetadata),
        storageClient.uploadAsJson(blogFeedMetadata),
      ]);
      toast.dismiss(uploadToast);

      console.log(user.address)
      const createToast = toast.loading("Creating your blog...");
      const result = await createGroup(sessionClient, {
        feed: {
          metadataUri: uri(blogFeedUri.uri),
          repliesRestricted: false,
        },
        metadataUri: uri(blogUri.uri),
        owner: user?.address,
        admins: [user?.address],
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(sessionClient.waitForTransaction);

      toast.dismiss(createToast);

      if (result.isErr()) {
        throw new Error(`Error creating blog: ${result.error}`);
      }

      const txHash = result.value;
      const groupResult = await fetchGroup(sessionClient, { txHash });

      if (groupResult.isErr()) {
        throw new Error(`Error fetching blog after creation: ${groupResult.error}`);
      }

      const blog = groupResult.value;
      if (!blog) {
        throw new Error("Blog data is null after creation");
      }

      blogAddress = blog.address;

      const updateToast = toast.loading("Saving blog settings...");
      const response = await fetch(`/api/blogs/${blog.address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            title: title,
            slug: slug,
            about: description || "",
          },
        }),
      });

      toast.dismiss(updateToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error saving blog settings: ${errorData.error || "Unknown error"}`);
      }

      toast.success("Blog created successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error during blog creation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create blog");

      if (blogAddress) {
        toast.info("Blog was created but some settings may not have been saved properly");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Blog</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col">
          <div className="space-y-6">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="max-w-xs">
              <Label htmlFor="slug">Slug</Label>
              <p className="text-xs text-muted-foreground mb-2">Used in the blog URL.</p>
              <Input
                id="slug"
                placeholder="blog-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={slugIsValid ? "" : "border-red-500"}
              />
              {!slugIsValid && (
                <p className="text-xs text-red-500 mt-1">
                  Slug must be 1-50 characters and contain only lowercase letters, numbers, and hyphens.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                About <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Short description of your blog"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="mt-auto pt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={loading || !title || !slug || !slugIsValid}>
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
