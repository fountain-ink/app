import { usePostActions } from "@/hooks/use-post-actions";
import { Post } from "@lens-protocol/client";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { ActionButton } from "./post-action-button";
import { PostCollect } from "./post-collect-dialog";

export const PostReactions = ({ post }: { post: Post }) => {
  const { handleLike, handleComment, handleCollect, isCollectSheetOpen, handleCollectSheetOpenChange } =
    usePostActions(post);

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
        onClick={handleCollect}
        shouldIncrementOnClick={false}
      />
      <ActionButton
        icon={Heart}
        label="Like"
        initialCount={post.stats.upvotes}
        strokeColor="rgb(215, 84, 127)"
        fillColor="rgba(215, 84, 127, 0.9)"
        onClick={handleLike}
        isActive={post.operations?.hasUpvoted}
        shouldIncrementOnClick={true}
      />
      <PostCollect post={post} isOpen={isCollectSheetOpen} onOpenChange={handleCollectSheetOpenChange} />
    </div>
  );
};
