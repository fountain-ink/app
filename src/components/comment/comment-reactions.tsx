import { Post } from "@lens-protocol/client";
import { Heart, MessageCircle } from "lucide-react";
import { usePostActions } from "@/hooks/use-post-actions";
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
  const hasUpvoted = operations?.hasUpvoted;

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
        isUserLoggedIn={isLoggedIn}
        isActive={hasUpvoted}
        isDisabled={!isLoggedIn}
      />
      {hasReplies && (
        <ActionButton
          icon={MessageCircle}
          label={isLoadingReplies ? "Loading..." : "Comments"}
          initialCount={stats.comments}
          strokeColor="hsl(var(--primary))"
          fillColor="hsl(var(--primary) / 0.8)"
          onClick={handleShowReplies}
          isUserLoggedIn={isLoggedIn}
          isDisabled={!hasReplies || isLoadingReplies}
          fillOnHover={false}
          fillOnClick={false}
        />
      )}
    </div>
  );
};
