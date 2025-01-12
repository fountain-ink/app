import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { ActionButton } from "./post-action-button";
import { Post } from "@lens-protocol/client";

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
  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ActionButton
        icon={reactions[0].icon}
        label={reactions[0].label}
        initialCount={post.stats.comments}
        strokeColor={reactions[0].strokeColor}
        fillColor={reactions[0].fillColor}
      />
      <ActionButton
        icon={reactions[1].icon}
        label={reactions[1].label}
        initialCount={post.stats.reposts}
        strokeColor={reactions[1].strokeColor}
        fillColor={reactions[1].fillColor}
      />
    </div>
  );
};
