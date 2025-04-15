import { Post } from "@lens-protocol/client";
import { ActionButton } from "./post-action-button";
import { usePostActionsButtons } from "@/hooks/use-post-actions-buttons";

export const PostReactions = ({ post }: { post: Post }) => {
  const { likeButton, collectButton, commentButton } = usePostActionsButtons({ post });
  const leftButtons = [commentButton, collectButton, likeButton];

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      {leftButtons.map((button) => (
        <ActionButton
          key={button.label}
          icon={button.icon}
          label={button.label}
          initialCount={button.initialCount}
          strokeColor={button.strokeColor}
          fillColor={button.fillColor}
          onClick={button.onClick}
          isActive={button.isActive}
          shouldIncrementOnClick={button.shouldIncrementOnClick}
          isDisabled={button.isDisabled}
          renderPopover={button.renderPopover}
          dropdownItems={button.dropdownItems}
        />
      ))}
    </div>
  );
};
