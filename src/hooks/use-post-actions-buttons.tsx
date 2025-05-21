"use client";

import { usePostActions } from "@/hooks/use-post-actions";
import { handlePlatformShare } from "@/lib/get-share-url";
import { Account, Post } from "@lens-protocol/client";
import {
  Bookmark,
  Heart,
  LucideIcon,
  MessageCircle,
  Share2,
  Ban,
  StarIcon,
  ShieldAlert,
  ShieldX,
  Meh,
} from "lucide-react";
import { IconType } from "react-icons";
import { TbBrandBluesky, TbBrandX, TbLink } from "react-icons/tb";
import { TipPopover } from "@/components/tip/tip-popover";
import { CoinIcon } from "@/components/icons/custom-icons";
import React, { ReactElement, JSXElementConstructor } from "react";
import { useAdminStatus } from "./use-admin-status";
import { useAdminPostActions } from "./use-admin-post-actions";

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
  isUserLoggedIn?: boolean;
  onConnectWallet?: () => void;
  onSelectProfile?: () => void;
};

type PostActionButtons = {
  likeButton: ActionButtonConfig;
  collectButton: ActionButtonConfig;
  commentButton: ActionButtonConfig;
  bookmarkButton: ActionButtonConfig;
  shareButton: ActionButtonConfig;
  adminButtons?: ActionButtonConfig[];
};

export const usePostActionsButtons = ({ post }: { post: Post }): PostActionButtons => {
  const {
    handleComment,
    handleCollect,
    handleBookmark,
    handleLike,
    isCommentSheetOpen,
    isCollectSheetOpen,
    stats,
    operations,
    isLoggedIn,
  } = usePostActions(post);

  const { isAdmin, isLoading: isAdminLoading } = useAdminStatus();
  const {
    handleBanAuthor,
    handleUnbanAuthor,
    handleFeaturePost,
    handleUnfeaturePost,
    isBanning,
    isUnbanning,
    isFeaturing,
    isUnfeaturing,
    isAuthorBanned,
    isFeatured,
    isLoadingStatus,
  } = useAdminPostActions(post, isAdmin);

  const likes = stats.upvotes;
  const collects = stats.collects;
  const tips = stats.tips;
  const comments = stats.comments;
  const reposts = stats.reposts;
  const bookmarks = stats.bookmarks;
  const quotes = stats.quotes;

  const isReposted = operations?.hasReposted;
  const isQuoted = operations?.hasQuoted;
  const canComment = operations?.canComment;
  const hasUpvoted = operations?.hasUpvoted;
  const hasBookmarked = operations?.hasBookmarked;
  const canCollect = operations?.canCollect;

  const buttons: PostActionButtons = {
    likeButton: {
      icon: Heart,
      label: "Like",
      initialCount: likes,
      strokeColor: "rgb(215, 84, 127)",
      fillColor: "rgba(215, 84, 127, 0.9)",
      onClick: handleLike,
      isActive: hasUpvoted,
      shouldIncrementOnClick: true,
      isDisabled: false,
      isUserLoggedIn: isLoggedIn,
    },
    collectButton: {
      icon: CoinIcon,
      label: canCollect ? "Tip or Collect" : "Tip",
      initialCount: collects + tips,
      strokeColor: "rgb(254,178,4)",
      fillColor: "rgba(254, 178, 4, 0.3)",
      shouldIncrementOnClick: false,
      renderPopover: (trigger: React.ReactElement) => (
        <TipPopover onCollectClick={handleCollect} post={post}>
          {trigger}
        </TipPopover>
      ),
      isActive: isCollectSheetOpen,
      isDisabled: false,
      isUserLoggedIn: isLoggedIn,
    },
    commentButton: {
      icon: MessageCircle,
      label: "Comment",
      initialCount: comments,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      onClick: () => handleComment(false),
      shouldIncrementOnClick: false,
      isActive: isCommentSheetOpen,
      isDisabled: false,
      isUserLoggedIn: true,
    },
    bookmarkButton: {
      icon: Bookmark,
      label: "Bookmark",
      isActive: hasBookmarked,
      initialCount: bookmarks,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      shouldIncrementOnClick: true,
      onClick: handleBookmark,
      isDisabled: false,
      isUserLoggedIn: isLoggedIn,
    },
    shareButton: {
      icon: Share2,
      label: "Share",
      isActive: isQuoted || isReposted,
      initialCount: reposts + quotes,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      shouldIncrementOnClick: false,
      hideCount: true,
      isUserLoggedIn: true,
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
    },
  };

  if (isAdmin && !isAdminLoading && !isLoadingStatus) {
    buttons.adminButtons = [
      {
        icon: Ban,
        label: isAuthorBanned ? "Author Banned" : "Ban Author",
        initialCount: 0,
        strokeColor: "hsl(var(--destructive))",
        fillColor: "hsl(var(--destructive) / 0.1)",
        isUserLoggedIn: true,
        shouldIncrementOnClick: false,
        isActive: isAuthorBanned,
        isDisabled: isBanning || isUnbanning,
        hideCount: true,
        dropdownItems: [
          ...(!isAuthorBanned
            ? [
                {
                  icon: ShieldX,
                  label: "Ban (Bot)",
                  onClick: () => handleBanAuthor("bot"),
                },
                {
                  icon: Meh,
                  label: "Ban (Spam)",
                  onClick: () => handleBanAuthor("spam"),
                },
                {
                  icon: ShieldAlert,
                  label: "Ban (Forbidden)",
                  onClick: () => handleBanAuthor("forbidden"),
                },
              ]
            : []),
          ...(isAuthorBanned
            ? [
                {
                  icon: ShieldX,
                  label: "Unban Author",
                  onClick: handleUnbanAuthor,
                },
              ]
            : []),
        ],
      },
      {
        icon: StarIcon,
        label: isFeatured ? "Featured" : "Feature Post",
        initialCount: 0,
        isUserLoggedIn: true,
        strokeColor: "hsl(var(--primary))",
        fillColor: "hsl(var(--primary) / 0.8)",
        shouldIncrementOnClick: false,
        onClick: isFeatured ? handleUnfeaturePost : handleFeaturePost,
        isActive: isFeatured,
        isDisabled: isFeaturing || isUnfeaturing,
        hideCount: true,
      },
    ];
  }

  return buttons;
};
