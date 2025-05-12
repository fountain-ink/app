import { Post } from "@lens-protocol/client";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const useAdminPostActions = (post: Post, isAdmin: boolean) => {
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);
  const [isFeaturing, setIsFeaturing] = useState(false);
  const [isUnfeaturing, setIsUnfeaturing] = useState(false);
  const [isAuthorBanned, setIsAuthorBanned] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(isAdmin);

  const { data: user } = useAuthenticatedUser()

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isAdmin) {
        setIsLoadingStatus(false);
        return;
      }

      setIsLoadingStatus(true);
      try {
        const banStatusRes = await fetch(`/api/admin/ban?address=${encodeURIComponent(post.author.address)}`);
        if (banStatusRes.ok) {
          const { isBanned } = await banStatusRes.json();
          setIsAuthorBanned(isBanned);
        } else {
          console.error("Failed to fetch ban status:", await banStatusRes.text());
          toast.error("Failed to fetch ban status");
        }

        const featureStatusRes = await fetch(`/api/admin/curate?slug=${encodeURIComponent(post.slug)}`);
        if (featureStatusRes.ok) {
          const { isFeatured } = await featureStatusRes.json();
          setIsFeatured(isFeatured);
        } else {
          console.error("Failed to fetch feature status:", await featureStatusRes.text());
          toast.error("Failed to fetch feature status");
        }


      } catch (error) {
        console.error("Error fetching admin status:", error);
        toast.error("Failed to fetch admin status");
      } finally {
        setIsLoadingStatus(false);
      }
    };

    if (isAdmin && post.author.address && post.slug) {
      fetchStatus();
    } else {
      setIsLoadingStatus(false);
    }
  }, [post.author.address, post.slug, isAdmin]);


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

      setIsAuthorBanned(true);
      toast.success(`Author ${post.author.username?.localName || authorAddress} has been banned${reason ? ` for ${reason}` : ''}`);
    } catch (error) {
      console.error("Error banning author:", error);
      toast.error(error instanceof Error ? error.message : "Failed to ban author");
    } finally {
      setIsBanning(false);
    }
  }, [post.author.address, post.author.username?.localName, user?.address]);

  const handleUnbanAuthor = useCallback(async () => {
    try {
      setIsUnbanning(true);
      const authorAddress = post.author.address;

      const response = await fetch(`/api/admin/ban?address=${encodeURIComponent(authorAddress)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unban author");
      }

      setIsAuthorBanned(false);
      toast.success(`Author ${post.author.username?.localName || authorAddress} has been unbanned`);
    } catch (error) {
      console.error("Error unbanning author:", error);
      toast.error(error instanceof Error ? error.message : "Failed to unban author");
    } finally {
      setIsUnbanning(false);
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

      setIsFeatured(true);
      toast.success(`Post has been featured successfully`);
    } catch (error) {
      console.error("Error featuring post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to feature post");
    } finally {
      setIsFeaturing(false);
    }
  }, [post.slug, post.id, user?.address]);

  const handleUnfeaturePost = useCallback(async () => {
    try {
      setIsUnfeaturing(true);

      const response = await fetch(`/api/admin/curate?slug=${encodeURIComponent(post.slug)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unfeature post");
      }

      setIsFeatured(false);
      toast.success(`Post has been unfeatured successfully`);
    } catch (error) {
      console.error("Error unfeaturing post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to unfeature post");
    } finally {
      setIsUnfeaturing(false);
    }
  }, [post.slug, post.id, user?.address]);


  return {
    handleBanAuthor,
    handleUnbanAuthor,
    handleFeaturePost,
    handleUnfeaturePost,
    isBanning,
    isUnbanning,
    isFeaturing,
    isUnfeaturing,
    isAuthorBanned,
    isFeatured,
    isLoadingStatus,
  };
}; 