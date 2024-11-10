"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScroll } from "@/hooks/use-scroll";
import { motion, useSpring } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Share2, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";

const actionButtons = [
  {
    icon: Heart,
    label: "Like",
    onClick: () => console.log("Like clicked"),
  },
  {
    icon: Bookmark,
    label: "Bookmark",
    onClick: () => console.log("Bookmark clicked"),
  },
  {
    icon: ShoppingBag,
    label: "Collect",
    onClick: () => console.log("Collect clicked"),
  },
  {
    icon: MessageCircle,
    label: "Comment",
    onClick: () => console.log("Comment clicked"),
  },
  {
    icon: Share2,
    label: "Share",
    onClick: () => console.log("Share clicked"),
  },
];

export const Footer = () => {
  const isVisible = useScroll();

  const springConfig = {
    stiffness: 300,
    damping: 20,
  };

  const y = useSpring(0, springConfig);

  if (!isVisible) {
    y.set(100);
  } else {
    y.set(0);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        style={{ y }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[40] px-6 py-3
          rounded-full backdrop-blur-xl bg-background/40 border border-border
          shadow-lg w-fit max-w-[90vw]"
      >
        <nav className="flex items-center gap-8">
          {actionButtons.map((button) => {
            const Icon = button.icon;

            return (
              <Tooltip key={button.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost3"}
                    onClick={button.onClick}
                    className="group flex flex-col items-center gap-1 transition-colors
                      text-muted-foreground hover:text-primary focus:outline-none
                      focus-visible:text-primary rounded-full px-2 py-2 w-10 h-10"
                  >
                    <Icon size={20} className="transition-transform group-hover:scale-110 group-active:scale-95" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{button.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </motion.div>
    </TooltipProvider>
  );
};
