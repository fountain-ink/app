import { Post } from "@lens-protocol/client";
import { ActionButton } from "./post-action-button";
import { usePostActionsButtons } from "@/hooks/use-post-actions-buttons";

export const PostReactions = ({ post, hideAdminButtons = false }: { post: Post; hideAdminButtons?: boolean }) => {
  const { likeButton, collectButton, commentButton, adminButtons } = usePostActionsButtons({ post });
  const leftButtons = [commentButton, collectButton, likeButton];

  return (
    <div className="flex flex-row gap-2 sm:gap-4 items-center justify-center">
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
          isDisabled={button.isDisabled}
          isUserLoggedIn={button.isUserLoggedIn}
          renderPopover={button.renderPopover}
          dropdownItems={button.dropdownItems}
        />
      ))}

      {!hideAdminButtons && adminButtons && adminButtons.length > 0 && (
        <div className="ml-auto flex gap-2">
          {adminButtons.map((button) => (
            <ActionButton
              key={button.label}
              icon={button.icon}
              label={button.label}
              initialCount={button.initialCount}
              strokeColor={button.strokeColor}
              fillColor={button.fillColor}
              onClick={button.onClick}
              isActive={button.isActive}
              isUserLoggedIn={button.isUserLoggedIn}
              isDisabled={button.isDisabled}
              hideCount={button.hideCount}
              dropdownItems={button.dropdownItems}
            />
          ))}
        </div>
      )}
    </div>
  );
};
