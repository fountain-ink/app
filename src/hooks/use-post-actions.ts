import { Post, PostReactionType } from "@lens-protocol/client";
import { addReaction, bookmarkPost, undoBookmarkPost, undoReaction } from "@lens-protocol/client/actions";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useSharedPostActions } from "@/contexts/post-actions-context";
import { getLensClient } from "@/lib/lens/client";
import { getPostUrl } from "@/lib/utils/get-post-url";

export const usePostActions = (post: Post) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getPostState, initPostState, updatePostState, updatePostStats, updatePostOperations } =
    useSharedPostActions();

  const { data: authenticatedUser, loading } = useAuthenticatedUser();
  const isLoggedIn = !!authenticatedUser && !loading;

  useEffect(() => {
    initPostState(post);
  }, [post, initPostState]);

  const sharedState = getPostState(post.id);

  const defaultOperations = {
    hasUpvoted: false,
    hasBookmarked: false,
    hasReposted: false,
    hasQuoted: false,
    canComment: false,
    canRepost: false,
    canQuote: false,
    canBookmark: false,
    canCollect: false,
    canDelete: false,
    canTip: false,
  };

  const { stats, operations, isCommentSheetOpen, isCollectSheetOpen } = useMemo(
    () => ({
      stats: sharedState?.stats ?? post.stats,
      operations: sharedState?.operations ?? sharedState?.operations ?? defaultOperations,
      isCommentSheetOpen: sharedState?.isCommentSheetOpen ?? false,
      isCollectSheetOpen: sharedState?.isCollectSheetOpen ?? false,
    }),
    [sharedState, post.stats, post.operations, defaultOperations],
  );

  const isCommentOpenParam = useMemo(
    () => searchParams.has("comment") && searchParams.get("comment") === post.slug,
    [searchParams, post.slug],
  );
  const isCollectOpenParam = useMemo(
    () => searchParams.has("collect") && searchParams.get("collect") === post.slug,
    [searchParams, post.slug],
  );

  useEffect(() => {
    if (sharedState && !sharedState.initialCommentUrlSynced) {
      const shouldOpen = isCommentOpenParam;
      if (shouldOpen && !sharedState.isCommentSheetOpen) {
        updatePostState(post.id, { isCommentSheetOpen: true, initialCommentUrlSynced: true });
      } else {
        updatePostState(post.id, { initialCommentUrlSynced: true });
      }
    }
  }, [isCommentOpenParam, post.id, sharedState, updatePostState]);

  useEffect(() => {
    if (sharedState && !sharedState.initialCollectUrlSynced) {
      const shouldOpen = isCollectOpenParam;
      if (shouldOpen && !sharedState.isCollectSheetOpen) {
        updatePostState(post.id, { isCollectSheetOpen: true, initialCollectUrlSynced: true });
      } else {
        updatePostState(post.id, { initialCollectUrlSynced: true });
      }
    }
  }, [isCollectOpenParam, post.id, sharedState, updatePostState]);

  const handleComment = useCallback(
    async (redirectToPost?: boolean) => {
      if (redirectToPost) {
        window.location.href = `${getPostUrl(post)}?comment=${post.slug}`;
        return;
      }

      const newOpenState = !isCommentSheetOpen;

      updatePostState(post.id, { isCommentSheetOpen: newOpenState });

      const params = new URLSearchParams(searchParams);
      if (!newOpenState) {
        params.delete("comment");
      } else {
        params.set("comment", post.slug);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [post.id, post.author.username?.localName, post.slug, isCommentSheetOpen, updatePostState, router, searchParams],
  );

  const handleCollect = useCallback(async () => {
    const newOpenState = !isCollectSheetOpen;
    updatePostState(post.id, { isCollectSheetOpen: newOpenState });

    const params = new URLSearchParams(searchParams);
    if (!newOpenState) {
      params.delete("collect");
    } else {
      params.set("collect", post.slug);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [post.id, post.slug, isCollectSheetOpen, updatePostState, router, searchParams]);

  const handleCommentSheetOpenChange = useCallback(
    (open: boolean) => {
      if (isCommentSheetOpen !== open) {
        updatePostState(post.id, { isCommentSheetOpen: open });
      }

      const params = new URLSearchParams(searchParams);
      const currentParam = params.get("comment");
      if (!open && currentParam === post.slug) {
        params.delete("comment");
        router.replace(`?${params.toString()}`, { scroll: false });
      } else if (open && currentParam !== post.slug) {
        params.set("comment", post.slug);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    },
    [post.id, post.slug, isCommentSheetOpen, updatePostState, router, searchParams],
  );

  const handleCollectSheetOpenChange = useCallback(
    (open: boolean) => {
      if (isCollectSheetOpen !== open) {
        updatePostState(post.id, { isCollectSheetOpen: open });
      }

      const params = new URLSearchParams(searchParams);
      const currentParam = params.get("collect");
      if (!open && currentParam === post.slug) {
        params.delete("collect");
        router.replace(`?${params.toString()}`, { scroll: false });
      } else if (open && currentParam !== post.slug) {
        params.set("collect", post.slug);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    },
    [post.id, post.slug, isCollectSheetOpen, updatePostState, router, searchParams],
  );

  const handleBookmark = useCallback(async () => {
    // Return early if user is not logged in
    if (!isLoggedIn) return null;

    const lens = await getLensClient();
    if (!lens.isSessionClient()) return null;

    const currentlyBookmarked = operations?.hasBookmarked || false;
    const currentCount = stats.bookmarks;

    updatePostOperations(post.id, { hasBookmarked: !currentlyBookmarked });
    updatePostStats(post.id, { bookmarks: currentlyBookmarked ? Math.max(0, currentCount - 1) : currentCount + 1 }); // Prevent negative counts

    try {
      if (currentlyBookmarked) {
        await undoBookmarkPost(lens, { post: post.id });
      } else {
        await bookmarkPost(lens, { post: post.id });
      }
    } catch (error) {
      console.error("Failed to handle bookmark:", error);
      updatePostOperations(post.id, { hasBookmarked: currentlyBookmarked });
      updatePostStats(post.id, { bookmarks: currentCount });
    }
  }, [post.id, operations, stats.bookmarks, updatePostOperations, updatePostStats, isLoggedIn]);

  const handleLike = useCallback(async () => {
    if (!isLoggedIn) return null;

    const lens = await getLensClient();
    if (!lens.isSessionClient()) return null;

    const currentlyLiked = operations?.hasUpvoted || false;
    const currentCount = stats.upvotes;

    updatePostOperations(post.id, { hasUpvoted: !currentlyLiked });
    updatePostStats(post.id, { upvotes: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1 }); // Prevent negative counts

    try {
      if (currentlyLiked) {
        await undoReaction(lens, { post: post.id, reaction: PostReactionType.Upvote });
      } else {
        await addReaction(lens, { post: post.id, reaction: PostReactionType.Upvote });
      }
    } catch (error) {
      console.error("Failed to handle like:", error);
      updatePostOperations(post.id, { hasUpvoted: currentlyLiked });
      updatePostStats(post.id, { upvotes: currentCount });
    }
  }, [post.id, operations, stats.upvotes, updatePostOperations, updatePostStats, isLoggedIn]);

  return {
    handleComment,
    handleCollect,
    handleBookmark,
    handleLike,
    isCommentSheetOpen,
    isCollectSheetOpen,
    handleCommentSheetOpenChange,
    handleCollectSheetOpenChange,
    stats,
    operations,
    isLoggedIn,
  };
};
