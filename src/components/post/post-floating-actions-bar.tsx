"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { usePostActions } from "@/hooks/use-post-actions";
import { useScroll } from "@/hooks/use-scroll";
import { handlePlatformShare } from "@/lib/get-share-url";
import { Account, AnyPost } from "@lens-protocol/client";
import { motion } from "motion/react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  PenLineIcon,
  Repeat2Icon,
  Share2,
  Share2Icon,
  ShoppingBag,
} from "lucide-react";
import { TbBrandBluesky, TbBrandX, TbLink } from "react-icons/tb";
import { useWalletClient } from "wagmi";
import { ActionButton } from "./post-action-button";
import { CommentSheet } from "../comment/comment-sheet";
import { PostCollect } from "./post-collect-dialog";
import { TipPopover } from "../tip/tip-popover";
import { CoinIcon } from "../icons/custom-icons";

export const FloatingActionBar = ({ post, account }: { post: AnyPost; account?: Account }) => {
  const { scrollProgress, shouldShow, shouldAnimate } = useScroll();
  const translateY = scrollProgress * 100;

  if (post.__typename !== "Post") {
    return null;
  }

  const {
    handleComment,
    handleCollect,
    handleBookmark,
    handleLike,
    isCommentOpen,
    isCollectOpen,
    isCommentSheetOpen,
    setIsCommentSheetOpen,
    isCollectSheetOpen,
    handleCollectSheetOpenChange,
  } = usePostActions(post);

  const handleCommentSheetOpenChange = (open: boolean) => {
    setIsCommentSheetOpen(open);
  };

  const likes = post.stats.upvotes;
  const collects = post.stats.collects;
  const tips = post.stats.tips;
  const comments = post.stats.comments;
  const reposts = post.stats.reposts;
  const bookmarks = post.stats.bookmarks;
  const quotes = post.stats.quotes;
  const isReposted = post.operations?.hasReposted;
  const isQuoted = post.operations?.hasQuoted;
  const canComment = post.operations?.canComment;
  const canRepost = post.operations?.canRepost;
  const canQuote = post.operations?.canQuote;

  const actionButtons = [
    {
      icon: Share2,
      label: "Share",
      isActive: isQuoted?.optimistic || isReposted?.optimistic,
      initialCount: reposts + quotes,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      shouldIncrementOnClick: false,
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
        // {
        //   icon: Share2Icon,
        //   label: "Lens",
        //   onClick: () => handlePlatformShare("lens"),
        // },
        // {
        //   icon: Repeat2Icon,
        //   label: "Repost",
        //   onClick: () => { },
        // },
        // {
        //   icon: PenLineIcon,
        //   label: "Quote",
        //   onClick: () => { },
        // },
      ],
    },
    {
      icon: Bookmark,
      label: "Bookmark",
      isActive: post.operations?.hasBookmarked,
      initialCount: bookmarks,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      shouldIncrementOnClick: true,
      onClick: handleBookmark,
    },
    {
      icon: CoinIcon,
      label: "Collect",
      initialCount: collects + tips,
      strokeColor: "rgb(254,178,4)",
      fillColor: "rgba(254, 178, 4, 0.3)",
      shouldIncrementOnClick: false,
      renderPopover: (trigger: React.ReactElement) => (
        <TipPopover onCollectClick={handleCollect} post={post}>
          {trigger}
        </TipPopover>
      ),
      isActive: isCollectOpen,
    },
    {
      icon: MessageCircle,
      label: "Comment",
      initialCount: comments,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      onClick: () => handleComment(false),
      shouldIncrementOnClick: false,
      isActive: isCommentOpen,
      isDisabled: !canComment,
    },
    {
      icon: Heart,
      label: "Like",
      initialCount: likes,
      strokeColor: "rgb(215, 84, 127)",
      fillColor: "rgba(215, 84, 127, 0.9)",
      onClick: handleLike,
      isActive: post.operations?.hasUpvoted,
      shouldIncrementOnClick: true,
    },
  ];

  return (
    <>
      <CommentSheet
        post={post}
        account={account}
        forcedOpen={isCommentSheetOpen}
        onOpenChange={handleCommentSheetOpenChange}
      />
      <PostCollect post={post} isOpen={isCollectSheetOpen} onOpenChange={handleCollectSheetOpenChange} />
      <TooltipProvider delayDuration={300}>
        <motion.div
          style={{
            opacity: 1.0 - scrollProgress,
          }}
          animate={{
            y: shouldAnimate ? (shouldShow ? 0 : 100) : translateY,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="fixed bottom-6 inset-x-0 mx-auto z-[40] pl-2 pr-4 py-0.5 rounded-full bg-background border border-border
             shadow-lg w-full max-w-[90vw] sm:max-w-[50vw] md:max-w-sm origin-bottom"
        >
          <nav className="flex items-center justify-between">
            {actionButtons.map((button) => (
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
                renderPopover={button.renderPopover}
              />
            ))}
          </nav>
        </motion.div>
      </TooltipProvider>
    </>
  );
};
