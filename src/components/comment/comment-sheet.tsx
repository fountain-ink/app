"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useComments } from "@/hooks/use-comments";
import { getLensClient } from "@/lib/lens/client";
import { Account, AnyPost, Post } from "@lens-protocol/client";
import { fetchPost } from "@lens-protocol/client/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GraphicHand2 } from "../icons/custom-icons";
import { CommentReplyArea } from "./comment-reply-area";
import { CommentView } from "./comment-view";

export const CommentSheet = ({ post, account }: { post: Post; account?: Account }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("comment");
  const commentId = searchParams.get("comment");
  const containerRef = useRef<HTMLDivElement>(null);
  const { comments, loading, hasMore, fetchComments, refresh, nextCursor, setComments } = useComments(post.id);
  const [isViewingNested, setIsViewingNested] = useState(false);

  useEffect(() => {
    if (!commentId || commentId === post.id || commentId === post.slug) {
      // If we're viewing root comments
      setIsViewingNested(false);
      refresh(0, false);
    } else {
      // If we're viewing a specific comment's replies
      const fetchComment = async () => {
        const client = await getLensClient();
        const result = await fetchPost(client, { post: commentId });

        if (result.isOk()) {
          const fetchedPost = result.value;
          if (fetchedPost && fetchedPost.__typename === "Post") {
            setComments([fetchedPost as AnyPost]);
            setIsViewingNested(true);
          }
        }
      };

      fetchComment();
    }
  }, [commentId]);

  const handleCreateComment = async () => {
    await refresh(0, true);
  };

  const handleMaxNestingReached = (comment: AnyPost) => {
    // Update URL to show the new comment's slug
    const params = new URLSearchParams(searchParams);
    const commentIdentifier = comment.slug;
    params.set("comment", commentIdentifier);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchComments(nextCursor);
    }
  }, [loading, hasMore, fetchComments, nextCursor]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleOpenChange = (open: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (!open) {
      params.delete("comment");
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:min-w-[450px] p-0">
        <div className="h-full flex flex-col">
          <div className="flex-none p-6 py-3">
            <span className="text-sm block">
              {isViewingNested ? "Replies" : "Comments"} {post.stats.comments > 0 && `(${post.stats.comments})`}
            </span>
          </div>

          <ScrollArea className="flex-1 h-full mr-1">
            <div ref={containerRef} className="overflow-visible">
              {!isViewingNested && (
                <div className="m-4 mt-0">
                  <CommentReplyArea
                    postId={post.id}
                    account={account}
                    onSubmit={handleCreateComment}
                    onCancel={() => handleOpenChange(false)}
                  />
                </div>
              )}

              {comments.length === 0 && !loading ? (
                <div className="text-muted-foreground flex flex-col items-center gap-4">
                  <div className="w-[70%] mx-auto">
                    <GraphicHand2 />
                  </div>
                  <span>Be the first one to comment</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4 m-6 overflow-visible">
                  {comments.map((comment) => {
                    if (comment.__typename !== "Post") return null;
                    return (
                      <CommentView
                        key={comment.id}
                        comment={comment}
                        nestingLevel={1}
                        maxNestingLevel={4}
                        onMaxNestingReached={handleMaxNestingReached}
                        autoShowReplies={isViewingNested}
                      />
                    );
                  })}
                  {loading && <div className="text-center py-4 text-muted-foreground">Loading...</div>}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
