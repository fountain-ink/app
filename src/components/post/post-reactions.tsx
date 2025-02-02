import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { ActionButton } from "./post-action-button";
import { Post } from "@lens-protocol/client";
import { usePostActions } from "@/hooks/use-post-actions";

export const PostReactions = ({ post }: { post: Post }) => {
  const { handleLike, handleComment, handleCollect } = usePostActions(post);

  const handleCollectRedirect = async () => {
    window.location.href = `/p/${post.author.username?.localName}/${post.slug}?collect=1`;
    return undefined;
  };

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ActionButton
        icon={MessageCircle}
        label="Comment"
        initialCount={post.stats.comments}
        strokeColor="hsl(var(--primary))"
        fillColor="hsl(var(--primary) / 0.8)"
        onClick={() => handleComment(true)}
        isActive={post.operations?.hasCommented.optimistic}
        shouldIncrementOnClick={false}
      />
      <ActionButton
        icon={ShoppingBag}
        label="Collect"
        initialCount={post.stats.collects}
        strokeColor="rgb(254,178,4)"
        fillColor="rgba(254, 178, 4, 0.3)"
        onClick={handleCollectRedirect}
        // isActive={post.stats.isCollectedByMe}
        shouldIncrementOnClick={false}
      />
      <ActionButton
        icon={Heart}
        label="Like"
        initialCount={post.stats.reactions}
        strokeColor="rgb(215, 84, 127)"
        fillColor="rgba(215, 84, 127, 0.9)"
        onClick={handleLike}
        isActive={post.operations?.hasUpvoted}
        shouldIncrementOnClick={true}
      />
    </div>
  );
};
