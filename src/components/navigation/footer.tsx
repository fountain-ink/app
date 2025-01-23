"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useScroll } from "@/hooks/use-scroll";
import { handlePlatformShare } from "@/lib/get-share-url";
import { getLensClient } from "@/lib/lens/client";
import { AnyPost, PostReactionType } from "@lens-protocol/client";
import { addReaction, undoReaction } from "@lens-protocol/client/actions";
import { motion } from "framer-motion";
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
import { ActionButton } from "../post/post-action-button";
import { useRouter, useSearchParams } from "next/navigation";

export const Footer = ({ post }: { post: AnyPost }) => {
  const { scrollProgress, shouldShow, shouldAnimate } = useScroll();
  const translateY = scrollProgress * 100;
  const walletClient = useWalletClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (post.__typename !== "Post") {
    return null;
  }

  const likes = post.stats.reactions;
  const collects = post.stats.collects;
  const comments = post.stats.comments;
  const reposts = post.stats.reposts;
  const bookmarks = post.stats.bookmarks;
  const quotes = post.stats.quotes;
  const isLikedByMe = post.operations?.hasUpvoted;
  const isCommented = post.operations?.hasCommented.optimistic;
  const isBookmarked = post.operations?.hasBookmarked;
  const isReposted = post.operations?.hasReposted;
  const isQuoted = post.operations?.hasQuoted;

  const handleComment = async () => {
    const params = new URLSearchParams(searchParams);
    params.set("comments", "true");
    router.push(`?${params.toString()}`, { scroll: false });
    return undefined;
  };

  const handleCollect = async () => {
    const params = new URLSearchParams(searchParams);
    params.set("collect", "true");
    router.push(`?${params.toString()}`, { scroll: false });
    return undefined;
  };

  const upvote = async () => {
    const lens = await getLensClient();

    if (!lens.isSessionClient()) {
      return null;
    }

    try {
      if (isLikedByMe) {
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
        {
          icon: Share2Icon,
          label: "Lens",
          onClick: () => handlePlatformShare("lens"),
        },
        {
          icon: Repeat2Icon,
          label: "Repost",
          onClick: () => {},
        },
        {
          icon: PenLineIcon,
          label: "Quote",
          onClick: () => {},
        },
      ],
    },
    {
      icon: Bookmark,
      label: "Bookmark",
      isActive: isBookmarked,
      initialCount: bookmarks,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      shouldIncrementOnClick: true,
    },
    {
      icon: ShoppingBag,
      label: "Collect",
      initialCount: collects,
      strokeColor: "rgb(254,178,4)",
      fillColor: "rgba(254, 178, 4, 0.3)",
      shouldIncrementOnClick: false,
      onClick: handleCollect,
    },
    {
      icon: MessageCircle,
      label: "Comment",
      initialCount: comments,
      strokeColor: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary) / 0.8)",
      isActive: isCommented,
      onClick: handleComment,
      shouldIncrementOnClick: false,
    },
    {
      icon: Heart,
      label: "Like",
      initialCount: likes,
      strokeColor: "rgb(215, 84, 127)",
      fillColor: "rgba(215, 84, 127, 0.9)",
      onClick: upvote,
      isActive: isLikedByMe,
      shouldIncrementOnClick: true,
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        style={{
          opacity: 1.2 - scrollProgress,
        }}
        animate={{
          y: shouldAnimate ? (shouldShow ? 0 : 100) : translateY,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="fixed bottom-6 inset-x-0 mx-auto z-[40] pl-2 pr-4 py-0.5 rounded-full backdrop-blur-xl bg-background/70 border border-border
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
            />
          ))}
        </nav>
      </motion.div>
    </TooltipProvider>
  );
};
