"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useScroll } from "@/hooks/use-scroll";
import { motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, PenLineIcon, Repeat2Icon, Share2, ShoppingBag } from "lucide-react";
import { TbBrandBluesky, TbBrandX, TbLink } from "react-icons/tb";
import { toast } from "sonner";
import { ActionButton } from "../post/post-action-button";

const actionButtons = [
  {
    icon: Share2,
    label: "Share",
    initialCount: 0,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    dropdownItems: [
      {
        icon: TbBrandX,
        label: "Twitter",
        onClick: () => shareToTwitter(window.location.href),
      },
      {
        icon: TbBrandBluesky,
        label: "Bluesky",
        onClick: () => console.log("Share to Bluesky"),
      },
      {
        icon: TbLink,
        label: "Copy Link",
        onClick: async () => {
          const success = await copyToClipboard(window.location.href);
          if (success) {
            toast.success("Link copied", {
              description: "URL has been copied to clipboard",
            });
          } else {
            toast.error("Failed to copy", { description: "Could not copy the URL to clipboard" });
          }
        },
      },
      {
        icon: Repeat2Icon,
        label: "Repost",
        onClick: () => console.log("Share to Lens"),
      },
      {
        icon: PenLineIcon,
        label: "Quote",
        onClick: () => console.log("Share to Lens"),
      },
    ],
  },
  {
    icon: Bookmark,
    label: "Bookmark",
    initialCount: 5600,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
  },
  {
    icon: ShoppingBag,
    label: "Collect",
    initialCount: 23,
    strokeColor: "rgb(254,178,4)",
    fillColor: "rgba(254, 178, 4, 0.3)",
  },
  {
    icon: MessageCircle,
    label: "Comment",
    initialCount: 8900,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
  },
  {
    icon: Heart,
    label: "Like",
    initialCount: 124000,
    strokeColor: "rgb(215, 84, 127)",
    fillColor: "rgba(215, 84, 127, 0.9)",
  },
];

const shareToTwitter = (url: string) => {
  const text = "Check this out";
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "_blank");
};

const copyToClipboard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
export const Footer = () => {
  const { scrollProgress, shouldShow, shouldAnimate } = useScroll();
  const translateY = scrollProgress * 100;

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
            />
          ))}
        </nav>
      </motion.div>
    </TooltipProvider>
  );
};
