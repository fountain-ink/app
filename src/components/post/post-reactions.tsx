import { usePostActions } from "@/hooks/use-post-actions";
import { Post } from "@lens-protocol/client";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { ActionButton } from "./post-action-button";

export const PostReactions = ({ post }: { post: Post }) => {
  const {
    handleLike,
    handleComment,
    handleCollect,
    stats,
    operations,
    isLoggedIn
  } = usePostActions(post);

  const canCollect = operations?.canSimpleCollect?.__typename === "SimpleCollectValidationPassed";
  const hasCommented = operations?.hasCommented || false;
  const hasUpvoted = operations?.hasUpvoted || false;

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ActionButton
        icon={MessageCircle}
        label="Comment"
        initialCount={stats.comments}
        strokeColor="hsl(var(--primary))"
        fillColor="hsl(var(--primary) / 0.8)"
        onClick={() => handleComment(true)}
        isActive={hasCommented.optimistic}
        shouldIncrementOnClick={false}
        isDisabled={!isLoggedIn}
      />
      {canCollect && (
        <ActionButton
          icon={ShoppingBag}
          label="Collect"
          initialCount={stats.collects}
          strokeColor="rgb(254,178,4)"
          fillColor="rgba(254, 178, 4, 0.3)"
          onClick={handleCollect}
          shouldIncrementOnClick={false}
          isDisabled={!isLoggedIn}
        />
      )}
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
    </div>
  );
};
