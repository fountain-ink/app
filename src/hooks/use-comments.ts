import { getLensClient } from "@/lib/lens/client";
import { AnyPost, PostReferenceType, postId } from "@lens-protocol/client";
import { fetchPostReferences } from "@lens-protocol/client/actions";
import { useCallback, useRef, useState } from "react";

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextCursor = useRef<string | undefined>(undefined);
  const currentCommentCount = useRef<number>(0);
  const expectingNewComment = useRef<boolean>(false);

  const fetchComments = useCallback(async (cursor?: string) => {
    // Only check hasMore for pagination, not for initial or refresh fetches
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
        setComments(prev => [...prev, ...newComments]);
      }
      nextCursor.current = pageInfo.next ?? undefined;
      setHasMore(!!pageInfo.next);
      return newComments.length;
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, postId]);

  const refresh = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    if (retryCount === 0) {
      // Mark that we're expecting a new comment on first try
      expectingNewComment.current = true;
    }

    nextCursor.current = undefined;
    setHasMore(true);
    const newCommentCount = await fetchComments();
    
    // If we got a valid comment count and either:
    // 1. The count hasn't changed and we're expecting a new comment, or
    // 2. The count is 0 and we're expecting the first comment
    if (typeof newCommentCount === 'number' && 
        ((newCommentCount === currentCommentCount.current && expectingNewComment.current) ||
         (newCommentCount === 0 && expectingNewComment.current)) &&
        retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return refresh(retryCount + 1);
    }
    
    // Update the comment count and reset expectation flag
    if (typeof newCommentCount === 'number') {
      currentCommentCount.current = newCommentCount;
      expectingNewComment.current = false;
    }
  }, [fetchComments]);

  return {
    comments,
    loading,
    hasMore,
    nextCursor: nextCursor.current,
    fetchComments,
    refresh
  };
}; 