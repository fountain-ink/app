"use client";

import { Account, AnyPost } from "@lens-protocol/client";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useActionBar } from "@/contexts/action-bar-context";
import { useOnScreen } from "@/hooks/use-on-screen";
import { usePostActionsButtons } from "@/hooks/use-post-actions-buttons";
import { useScroll } from "@/hooks/use-scroll";
import { ActionButton } from "./post-action-button";

export const FloatingActionBar = ({ post, account }: { post: AnyPost; account?: Account }) => {
  const { scrollProgress, shouldShow, shouldAnimate } = useScroll();
  const translateY = scrollProgress * 100;
  const { actionBarRef } = useActionBar();
  const isActionBarVisible = useOnScreen(actionBarRef, { threshold: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [tipPopoverOpen, setTipPopoverOpen] = useState(false);

  useEffect(() => {
    const isHiding = isActionBarVisible || (!shouldShow && shouldAnimate);
    if (isHiding && tipPopoverOpen) {
      setTipPopoverOpen(false);
    }
  }, [isActionBarVisible, shouldShow, shouldAnimate, tipPopoverOpen]);

  if (post.__typename !== "Post") {
    return null;
  }

  const { likeButton, collectButton, commentButton, bookmarkButton, shareButton } = usePostActionsButtons({
    post,
    tipPopoverOpen,
    onTipPopoverChange: setTipPopoverOpen,
  });

  const actionButtons = [shareButton, bookmarkButton, collectButton, commentButton, likeButton];

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <motion.div
          ref={containerRef}
          style={{
            opacity: isActionBarVisible ? 0 : 1.0 - scrollProgress,
          }}
          animate={{
            y: isActionBarVisible ? 100 : shouldAnimate ? (shouldShow ? 0 : 100) : translateY,
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
                renderPopover={button.renderPopover}
                isDisabled={button.isDisabled}
                hideCount={button.hideCount}
                isUserLoggedIn={button.isUserLoggedIn}
              />
            ))}
          </nav>
        </motion.div>
      </TooltipProvider>
    </>
  );
};
