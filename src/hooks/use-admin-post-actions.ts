import { Post } from "@lens-protocol/client";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useAdminPostActions = (post: Post) => {
  const [isBanning, setIsBanning] = useState(false);
  const [isFeaturing, setIsFeaturing] = useState(false);
  const { data: user } = useAuthenticatedUser()

  const handleBanAuthor = useCallback(async (reason: string = "") => {
    try {
      setIsBanning(true);
      const authorAddress = post.author.address;

      const response = await fetch("/api/admin/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: authorAddress,
          reason: reason,
          added_by: user?.address
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to ban author");
      }

      toast.success(`Author ${post.author.username?.localName || authorAddress} has been banned${reason ? ` for ${reason}` : ''}`);
    } catch (error) {
      console.error("Error banning author:", error);
      toast.error(error instanceof Error ? error.message : "Failed to ban author");
    } finally {
      setIsBanning(false);
    }
  }, [post.author.address, post.author.username?.localName, user?.address]);

  const handleFeaturePost = useCallback(async () => {
    try {
      setIsFeaturing(true);

      const response = await fetch("/api/admin/curate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: post.slug,
          added_by: user?.address
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to feature post");
      }

      toast.success(`Post "${post.id}" has been featured`);
    } catch (error) {
      console.error("Error featuring post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to feature post");
    } finally {
      setIsFeaturing(false);
    }
  }, [post.slug, post.id, user?.address]);

  return {
    handleBanAuthor,
    handleFeaturePost,
    isBanning,
    isFeaturing
  };
}; 