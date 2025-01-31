"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Account, Post } from "@lens-protocol/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { CommentReplyArea } from "./comment-reply-area";
import { GraphicHand2 } from "../icons/custom-icons";
import { CommentView } from "./comment-view";
import { useComments } from "@/hooks/use-comments";

export const CommentSheet = ({ post, account }: { post: Post; account?: Account }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("comment");
  const containerRef = useRef<HTMLDivElement>(null);
  const { comments, loading, hasMore, fetchComments, refresh, nextCursor } = useComments(post.id);

  const handleCreateComment = async () => {
    await refresh();
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchComments(nextCursor);
    }
  }, [loading, hasMore, fetchComments, nextCursor]);

  useEffect(() => {
    if (isOpen && comments.length === 0) {
      refresh();
    }
  }, [isOpen, post.id, comments.length, refresh]);

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
              Comments {post.stats.comments > 0 && `(${post.stats.comments})`}
            </span>
          </div>

          <ScrollArea className="flex-1 h-full mr-1">
            <div ref={containerRef} className="py-2 overflow-visible">
              <div className="m-4 mt-0">
                <CommentReplyArea 
                  postId={post.id} 
                  account={account} 
                  onSubmit={handleCreateComment} 
                  onCancel={() => handleOpenChange(false)} 
                />
              </div>

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
                    return <CommentView key={comment.id} comment={comment} />;
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
