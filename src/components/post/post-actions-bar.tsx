"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { usePostActions } from "@/hooks/use-post-actions";
import { handlePlatformShare } from "@/lib/get-share-url";
import { Account, AnyPost, Post } from "@lens-protocol/client";
import { Bookmark, Heart, LucideIcon, MessageCircle, Share2 } from "lucide-react";
import { IconType } from "react-icons";
import { TbBrandBluesky, TbBrandX, TbLink } from "react-icons/tb";
import { ActionButton } from "./post-action-button";
import { TipPopover } from "../tip/tip-popover";
import { CoinIcon } from "../icons/custom-icons";
import React, { ReactElement, JSXElementConstructor } from "react";

type ActionButtonConfig = {
  icon: LucideIcon | IconType | React.FC<any>;
  label: string;
  initialCount: number;
  strokeColor: string;
  fillColor: string;
  isActive?: boolean;
  shouldIncrementOnClick: boolean;
  onClick?: () => Promise<any> | undefined;
  renderPopover?: (
    trigger: ReactElement<any, string | JSXElementConstructor<any>>,
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  isDisabled?: boolean;
  dropdownItems?: {
    icon: LucideIcon | IconType | React.FC<any>;
    label: string;
    onClick: () => void;
  }[];
  hideCount?: boolean;
};

export const PostActionsBar = ({ post, account }: { post: AnyPost; account?: Account }) => {
  if (post.__typename !== "Post") {
    return null;
  }

  const typedPost = post as Post;

  const {
    handleComment,
    handleCollect,
    handleBookmark,
    handleLike,
    isCommentSheetOpen,
    isCollectSheetOpen,
    handleCollectSheetOpenChange,
    handleCommentSheetOpenChange,
    stats,
    operations,
  } = usePostActions(typedPost);

  const likes = stats.upvotes;
  const collects = stats.collects;
  const tips = stats.tips;
  const comments = stats.comments;
  const reposts = stats.reposts;
  const bookmarks = stats.bookmarks;
  const quotes = stats.quotes;
  const isReposted = operations.hasReposted;
  const isQuoted = operations.hasQuoted;
  const canComment = operations.canComment;
  const hasUpvoted = operations.hasUpvoted;
  const hasBookmarked = operations.hasBookmarked;

  const likeButton: ActionButtonConfig = {
    icon: Heart,
    label: "Like",
    initialCount: likes,
    strokeColor: "rgb(215, 84, 127)",
    fillColor: "rgba(215, 84, 127, 0.9)",
    onClick: handleLike,
    isActive: hasUpvoted,
    shouldIncrementOnClick: true,
  };

  const collectButton: ActionButtonConfig = {
    icon: CoinIcon,
    label: "Collect",
    initialCount: collects + tips,
    strokeColor: "rgb(254,178,4)",
    fillColor: "rgba(254, 178, 4, 0.3)",
    shouldIncrementOnClick: false,
    renderPopover: (trigger: React.ReactElement) => (
      <TipPopover onCollectClick={handleCollect} post={typedPost}>
        {trigger}
      </TipPopover>
    ),
    isActive: isCollectSheetOpen,
  };

  const commentButton: ActionButtonConfig = {
    icon: MessageCircle,
    label: "Comment",
    initialCount: comments,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    onClick: () => handleComment(false),
    shouldIncrementOnClick: false,
    isActive: isCommentSheetOpen,
    isDisabled: !canComment,
  };

  const bookmarkButton: ActionButtonConfig = {
    icon: Bookmark,
    label: "Bookmark",
    isActive: hasBookmarked,
    initialCount: bookmarks,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    shouldIncrementOnClick: true,
    onClick: handleBookmark,
  };

  const shareButton: ActionButtonConfig = {
    icon: Share2,
    label: "Share",
    isActive: isQuoted?.optimistic || isReposted?.optimistic,
    initialCount: reposts + quotes,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    shouldIncrementOnClick: false,
    hideCount: true,
    dropdownItems: [
      {
        icon: TbLink,
        label: "Copy Link",
        onClick: () => handlePlatformShare("copy"),
      },
      {
        icon: TbBrandX,
        label: "Twitter",
        onClick: () => handlePlatformShare("x"),
      },
      {
        icon: TbBrandBluesky,
        label: "Bluesky",
        onClick: () => handlePlatformShare("bluesky"),
      },
    ],
  };

  const leftButtons: ActionButtonConfig[] = [likeButton, collectButton, commentButton];
  const rightButtons: ActionButtonConfig[] = [bookmarkButton, shareButton];

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center justify-center gap-4 sm:gap-0 sm:justify-between w-full ">
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
                shouldIncrementOnClick={button.shouldIncrementOnClick}
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
                dropdownItems={button.dropdownItems}
                onClick={button.onClick}
                isActive={button.isActive}
                shouldIncrementOnClick={button.shouldIncrementOnClick}
              />
            ))}
          </div>
        </div>
      </TooltipProvider>
    </>
  );
};
