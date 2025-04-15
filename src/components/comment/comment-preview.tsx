"use client";

import { useComments } from "@/hooks/use-comments";
import { Post } from "@lens-protocol/client";
import { Button } from "@/components/ui/button";
import { CommentView } from "./comment-view";
import { useEffect } from "react";
import { usePostActions } from "@/hooks/use-post-actions";

export const CommentPreview = ({ post }: { post: Post }) => {
  const { comments, loading, refresh } = useComments(post.id);
  const { handleComment, stats } = usePostActions(post);

  useEffect(() => {
    refresh(0, false);
  }, []);

  const visibleComments = comments.slice(0, 3);
  const totalComments = stats.comments;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-lg font-medium px-1">Comments {totalComments > 0 && `(${totalComments})`}</span>

      {loading && visibleComments.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
      )}

      {!loading && visibleComments.length === 0 && totalComments > 0 && (
        <div className="text-center py-4 text-muted-foreground">Could not load comments.</div>
      )}

      {!loading && totalComments === 0 && (
        <div className="text-muted-foreground flex flex-col items-center my-4 gap-4 px-4">
          <span>Be the first one to comment.</span>
          <Button variant="default" onClick={() => handleComment(false)}>
            Write a comment
          </Button>
        </div>
      )}

      {visibleComments.length > 0 && (
        <div className="flex flex-col gap-4 px-4 overflow-visible">
          {visibleComments.map((comment) => (
            <CommentView
              key={comment.id}
              comment={comment}
              nestingLevel={1}
              maxNestingLevel={2}
              onMaxNestingReached={() => handleComment(false)}
            />
          ))}
        </div>
      )}

      {totalComments > 0 && (
        <Button variant="outline" onClick={() => handleComment(false)} className="mt-2">
          {totalComments > 3 ? `View all ${totalComments} comments` : "View all comments"}
        </Button>
      )}
    </div>
  );
};
