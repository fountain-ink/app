import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { ActionButton } from "./post-action-button";
import { Post, PostReactionType } from "@lens-protocol/client";
import { getLensClient } from "@/lib/lens/client";
import { addReaction, undoReaction } from "@lens-protocol/client/actions";

const reactions = [
  {
    icon: MessageCircle,
    label: "Comment",
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
  },
  {
    icon: Heart,
    label: "Like",
    strokeColor: "rgb(215, 84, 127)",
    fillColor: "rgba(215, 84, 127, 0.9)",
  },
] as const;

export const PostReactions = ({ post }: { post: Post }) => {
  const handleLike = async () => {
    const lens = await getLensClient();

    if (!lens.isSessionClient()) {
      return null;
    }

    try {
      if (post.operations?.hasUpvoted) {
        await undoReaction(lens, {
          post: post.id,
          reaction: PostReactionType.Upvote,
        });
      } else {
        await addReaction(lens, {
          post: post.id,
          reaction: PostReactionType.Upvote,
        });
      }
    } catch (error) {
      console.error("Failed to handle reaction:", error);
      throw error; // Propagate error to revert optimistic update
    }
  };

  const handleComment = async () => {
    const postUrl = `/p/${post.author.username?.localName}/${post.slug}?comments=true`;
    window.location.href = postUrl;
    return undefined;
  };

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ActionButton
        icon={reactions[0].icon}
        label={reactions[0].label}
        initialCount={post.stats.comments}
        strokeColor={reactions[0].strokeColor}
        fillColor={reactions[0].fillColor}
        onClick={handleComment}
      />
      <ActionButton
        icon={reactions[1].icon}
        label={reactions[1].label}
        initialCount={post.stats.reactions}
        strokeColor={reactions[1].strokeColor}
        fillColor={reactions[1].fillColor}
        onClick={handleLike}
        isActive={post.operations?.hasUpvoted}
      />
    </div>
  );
};
