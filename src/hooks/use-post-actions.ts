import { getLensClient } from "@/lib/lens/client";
import { Post, PostReactionType } from "@lens-protocol/client";
import { addReaction, bookmarkPost, undoBookmarkPost, undoReaction } from "@lens-protocol/client/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const usePostActions = (post: Post) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCommentOpen = searchParams.has("comment");
  const isCollectOpen = searchParams.has("collect");
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(isCommentOpen);

  useEffect(() => {
    setIsCommentSheetOpen(isCommentOpen);
  }, [isCommentOpen]);

  const handleComment = async (redirectToPost?: boolean) => {
    if (redirectToPost) {
      window.location.href = `/p/${post.author.username?.localName}/${post.slug}?comment=${post.slug}`;
      return;
    }

    setIsCommentSheetOpen(!isCommentSheetOpen);

    const params = new URLSearchParams(searchParams);
    if (isCommentOpen) {
      params.delete("comment");
    } else {
      params.append("comment", post.slug);
    }
    router.push(`?${params.toString()}`, { scroll: false });
    return undefined;
  };

  const handleCollect = async () => {
    const params = new URLSearchParams(searchParams);
    if (isCollectOpen) {
      params.delete("collect");
    } else {
      params.append("collect", post.slug);
    }
    router.push(`?${params.toString()}`, { scroll: false });
    return undefined;
  };

  const handleBookmark = async () => {
    const lens = await getLensClient();

    if (!lens.isSessionClient()) {
      return null;
    }

    try {
      if (post.operations?.hasBookmarked) {
        await undoBookmarkPost(lens, {
          post: post.id,
        });
      } else {
        await bookmarkPost(lens, {
          post: post.id,
        });
      }
    } catch (error) {
      console.error("Failed to handle bookmark:", error);
      throw error;
    }
  };

  const handleLike = async () => {
    const lens = await getLensClient();

    if (!lens.isSessionClient()) {
      return null;
    }

    try {
      if (post.operations?.hasUpvoted) {
        await undoReaction(lens, {
          post: post.id,
          reaction: PostReactionType.Upvote,
        });
      } else {
        await addReaction(lens, {
          post: post.id,
          reaction: PostReactionType.Upvote,
        });
      }
    } catch (error) {
      console.error("Failed to handle like:", error);
      throw error;
    }
  };

  return {
    handleComment,
    handleCollect,
    handleBookmark,
    handleLike,
    isCommentOpen,
    isCollectOpen,
    isCommentSheetOpen,
    setIsCommentSheetOpen,
  };
};
