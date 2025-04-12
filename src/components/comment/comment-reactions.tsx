import { usePostActions } from "@/hooks/use-post-actions";
import { Post } from "@lens-protocol/client";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "../post/post-action-button";

interface CommentReactionsProps {
  comment: Post;
  onShowReplies?: () => void;
  hasReplies?: boolean;
  isLoadingReplies?: boolean;
}

export const CommentReactions = ({
  comment,
  onShowReplies,
  hasReplies = false,
  isLoadingReplies = false,
}: CommentReactionsProps) => {
  const { handleLike, stats, operations, isLoggedIn } = usePostActions(comment);

  const hasUpvoted = operations?.hasUpvoted || false;

  const handleShowReplies = async () => {
    onShowReplies?.();
    return undefined;
  };

  return (
    <div className="flex gap-3">
      <ActionButton
        icon={Heart}
        label="Like"
        initialCount={stats.upvotes}
        strokeColor="rgb(215, 84, 127)"
        fillColor="rgba(215, 84, 127, 0.9)"
        onClick={handleLike}
        isActive={hasUpvoted}
        shouldIncrementOnClick={true}
        isDisabled={!isLoggedIn}
      />
      <ActionButton
        icon={MessageCircle}
        label={isLoadingReplies ? "Loading..." : "Comments"}
        initialCount={stats.comments}
        strokeColor="hsl(var(--primary))"
        fillColor="hsl(var(--primary) / 0.8)"
        onClick={handleShowReplies}
        isDisabled={!hasReplies || isLoadingReplies}
        shouldIncrementOnClick={false}
        fillOnHover={false}
        fillOnClick={false}
      />
    </div>
  );
};
