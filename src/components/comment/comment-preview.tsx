"use client";

import { useComments } from "@/hooks/use-comments";
import { Account, AnyPost, Post } from "@lens-protocol/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CommentView } from "./comment-view";
import { GraphicHand2 } from "../icons/custom-icons";
import { useEffect } from "react";

export const CommentPreview = ({
  post,
  account,
}: {
  post: Post;
  account?: Account;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { comments, loading, refresh } = useComments(post.id);

  useEffect(() => {
    refresh(0, false);
  }, [refresh, post.id]);

  const openCommentSheet = () => {
    const params = new URLSearchParams(searchParams);
    params.set("comment", post.slug);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const visibleComments = comments.slice(0, 3);
  const totalComments = post.stats.comments;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-lg font-medium px-1">
        Comments {totalComments > 0 && `(${totalComments})`}
      </span>

      {loading && visibleComments.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
      )}

      {!loading && visibleComments.length === 0 && totalComments > 0 && (
        <div className="text-center py-4 text-muted-foreground">Could not load comments.</div>
      )}

      {!loading && totalComments === 0 && (
        <div className="text-muted-foreground flex flex-col items-center my-4 gap-4 px-4">
          <span>Be the first one to comment</span>
        </div>
      )}

      {visibleComments.length > 0 && (
        <div className="flex flex-col gap-4 px-4 overflow-visible">
          {visibleComments.map((comment) => (
            <CommentView
              key={comment.id}
              comment={comment}
              nestingLevel={1}
              maxNestingLevel={1}
              onMaxNestingReached={openCommentSheet}
            />
          ))}
        </div>
      )}

      {totalComments > 0 && (
        <Button variant="outline" onClick={openCommentSheet} className="mt-2">
          {totalComments > 3 ? `View all ${totalComments} comments` : "View comments"}
        </Button>
      )}
    </div>
  );
}; 