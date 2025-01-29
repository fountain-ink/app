"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLensClient } from "@/lib/lens/client";
import { Account, AnyPost, Post, PostReferenceType, postId } from "@lens-protocol/client";
import { fetchPostReferences } from "@lens-protocol/client/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommentReplyArea } from "./comment-reply-area";
import { GraphicHand2 } from "../icons/custom-icons";
import { UserAvatar } from "../user/user-avatar";
import { CommentView } from "./comment-view";

export const CommentSheet = ({ post, account }: { post: Post; account?: Account }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("comment");
  const [comments, setComments] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextCursor = useRef<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateComment = async (content: string) => {
    console.log("Creating comment:", content);
  };

  const fetchComments = async (cursor?: string) => {
    if (loading || (!cursor && !hasMore)) return;

    setLoading(true);
    try {
      const client = await getLensClient();
      const result = await fetchPostReferences(client, {
        referencedPost: postId(post.id),
        referenceTypes: [PostReferenceType.CommentOn],
        ...(cursor ? { cursor } : {}),
      });

      if (result.isErr()) {
        console.error("Failed to fetch comments:", result.error);
        return;
      }

      const { items, pageInfo } = result.value;
      setComments((prev) => (cursor ? [...prev, ...Array.from(items)] : Array.from(items)));
      nextCursor.current = pageInfo.next ?? undefined;
      setHasMore(!!pageInfo.next);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchComments(nextCursor.current);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (isOpen) {
      setComments([]);
      nextCursor.current = undefined;
      setHasMore(true);
      fetchComments();
    }
  }, [isOpen, post.id]);

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

  const renderComment = (comment: AnyPost) => {
    if (comment.__typename !== "Post") return null;
    return <CommentView key={comment.id} comment={comment} />;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:min-w-[450px] p-0">
        <div className="h-full flex flex-col">
          <div className="flex-none p-6 pb-0">
            <span className="text-sm -mt-2 mb-4 block">Comments</span>
            <CommentReplyArea 
              postId={post.id} 
              account={account} 
              onSubmit={handleCreateComment} 
              onCancel={() => handleOpenChange(false)} 
            />
          </div>


          <ScrollArea className="flex-1 px-6 mr-1" onScrollCapture={handleScroll}>
            <div ref={containerRef}>
              {comments.length === 0 && !loading ? (
                <div className="text-muted-foreground flex flex-col items-center gap-4">
                  <div className="w-[70%] mx-auto">
                    <GraphicHand2 />
                  </div>
                  <span>Be the first one to comment</span>
                </div>
              ) : (
                <div className="space-y-4 overflow-visible">
                  {comments.map((comment) => renderComment(comment))}
                  {loading && <div className="text-center py-4 text-muted-foreground">Loading more comments...</div>}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
