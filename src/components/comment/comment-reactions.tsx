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
  const { handleLike } = usePostActions(comment);
  const [isRepliesVisible, setIsRepliesVisible] = useState(false);

  const handleToggleReplies = async () => {
    setIsRepliesVisible(!isRepliesVisible);
    onShowReplies?.();
    return undefined;
  };

  return (
    <div className="flex gap-3">
      <ActionButton
        icon={Heart}
        label="Like"
        initialCount={comment.stats.reactions}
        strokeColor="rgb(215, 84, 127)"
        fillColor="rgba(215, 84, 127, 0.9)"
        onClick={handleLike}
        isActive={comment.operations?.hasUpvoted}
        shouldIncrementOnClick={true}
      />
      <ActionButton
        icon={MessageCircle}
        label={isLoadingReplies ? "Loading..." : "Comments"}
        initialCount={comment.stats.comments}
        strokeColor="hsl(var(--primary))"
        fillColor="hsl(var(--primary) / 0.8)"
        onClick={handleToggleReplies}
        isActive={isRepliesVisible}
        shouldIncrementOnClick={false}
      />
    </div>
  );
};
