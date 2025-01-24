"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getLensClient } from "@/lib/lens/client";
import { AnyPost, Post, PostReferenceType, postId } from "@lens-protocol/client";
import { fetchPostReferences } from "@lens-protocol/client/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostReplyArea } from "./post-reply-area";
import { GraphicHand2 } from "../icons/custom-icons";

export const PostComments = ({ post }: { post: Post }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("comment");
  const [comments, setComments] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextCursor = useRef<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateComment = async (content: string) => {
    // TODO: Implement comment creation
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

    return (
      <div key={comment.id} className="border-b pb-4">
        <div className="font-medium">{comment.author.username?.localName}</div>
        <div className="text-sm text-muted-foreground">
          {"content" in comment.metadata && comment.metadata.content}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] p-0">
        <div className="h-full flex flex-col p-6">
          <h2 className="text-lg mb-4">Comments</h2>
          <PostReplyArea onSubmit={handleCreateComment} />
          <div ref={containerRef} className="flex-1 overflow-auto">
            {comments.length === 0 && !loading ? (
              <div className="text-muted-foreground flex flex-col items-center gap-4">
                <GraphicHand2 />
                <span>Be the first one to comment</span>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => renderComment(comment))}
                {loading && <div className="text-center py-4 text-muted-foreground">Loading more comments...</div>}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
