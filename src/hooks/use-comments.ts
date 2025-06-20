import { AnyPost, PostReferenceType } from "@lens-protocol/client";
import { fetchPostReferences } from "@lens-protocol/client/actions";
import { useCallback, useRef, useState } from "react";
import { getLensClient } from "@/lib/lens/client";

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextCursor = useRef<string | undefined>(undefined);
  const currentCommentCount = useRef<number>(0);
  const expectingNewComment = useRef<boolean>(false);

  const fetchComments = useCallback(
    async (cursor?: string) => {
      if (loading || (cursor && !hasMore)) return;

      setLoading(true);
      try {
        const client = await getLensClient();
        const result = await fetchPostReferences(client, {
          referencedPost: postId,
          referenceTypes: [PostReferenceType.CommentOn],
          ...(cursor ? { cursor } : {}),
        });

        if (result.isErr()) {
          console.error("Failed to fetch comments:", result.error);
          return;
        }

        const { items, pageInfo } = result.value;
        const newComments = Array.from(items);

        if (!cursor) {
          setComments(newComments);
        } else {
          setComments((prev) => [...prev, ...newComments]);
        }
        nextCursor.current = pageInfo.next ?? undefined;
        setHasMore(!!pageInfo.next);
        return newComments.length;
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, postId],
  );

  const refresh = useCallback(
    async (retryCount = 0, expectNew = false) => {
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      if (retryCount === 0 && expectNew) {
        // Only mark that we're expecting a new comment if explicitly told to
        expectingNewComment.current = true;
      }

      nextCursor.current = undefined;
      setHasMore(true);
      const newCommentCount = await fetchComments();

      // Only retry if:
      // 1. We got a valid count
      // 2. We're expecting a new comment (e.g., after posting)
      // 3. Either the count hasn't changed or it's still 0
      // 4. We haven't exceeded max retries
      if (
        typeof newCommentCount === "number" &&
        expectingNewComment.current &&
        newCommentCount === currentCommentCount.current &&
        retryCount < maxRetries
      ) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return refresh(retryCount + 1, expectNew);
      }

      // Update the comment count and reset expectation flag
      if (typeof newCommentCount === "number") {
        currentCommentCount.current = newCommentCount;
        expectingNewComment.current = false;
      }
    },
    [fetchComments],
  );

  // Add a function to manually set comments
  const setCommentsManually = useCallback((newComments: AnyPost[]) => {
    setComments(newComments);
    currentCommentCount.current = newComments.length;
    nextCursor.current = undefined;
    setHasMore(false);
  }, []);

  return {
    comments,
    loading,
    hasMore,
    nextCursor: nextCursor.current,
    fetchComments,
    refresh,
    setComments: setCommentsManually,
  };
};
