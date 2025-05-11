"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Account, Post } from "@lens-protocol/client";
import { useActionBar } from "@/contexts/action-bar-context";
import { usePostActionsButtons } from "@/hooks/use-post-actions-buttons";
import { ActionButton } from "./post-action-button";

export const PostActionsBar = ({ post, account }: { post: Post; account?: Account }) => {
  const { actionBarRef } = useActionBar();
  const { likeButton, collectButton, commentButton, bookmarkButton, shareButton } = usePostActionsButtons({ post });

  const leftButtons = [likeButton, collectButton, commentButton];
  const rightButtons = [bookmarkButton, shareButton];

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div
          ref={actionBarRef}
          className="flex items-center gap-4 sm:gap-0 justify-between w-full "
        >
          <div className="flex items-center gap-4">
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
                isUserLoggedIn={button.isUserLoggedIn}
                renderPopover={button.renderPopover}
                isDisabled={button.isDisabled}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {rightButtons.map((button) => (
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
                dropdownItems={button.dropdownItems}
                hideCount={button.hideCount}
              />
            ))}
          </div>
        </div>
      </TooltipProvider>
    </>
  );
};
