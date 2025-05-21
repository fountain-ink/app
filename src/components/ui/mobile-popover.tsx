"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@udecode/cn";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

export const MobilePopover: React.FC<CustomPopoverProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  contentClassName,
  side = "top",
  sideOffset = 10,
  align = "center",
}) => {
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentStyle, setContentStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!open || !triggerRef.current || !contentRef.current) {
      setContentStyle({});
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentHeight = contentRef.current.offsetHeight;
    const contentWidth = contentRef.current.offsetWidth;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let desktopLeft = 0;

    if (isMobile) {
      top = triggerRect.top - contentHeight - sideOffset;

      if (top < sideOffset && triggerRect.bottom + contentHeight + sideOffset < viewportHeight) {
        top = triggerRect.bottom + sideOffset;
      } else if (top < sideOffset) {
        top = sideOffset;
      }

      if (top + contentHeight > viewportHeight - sideOffset) {
        top = viewportHeight - contentHeight - sideOffset;
        if (top < sideOffset) top = sideOffset;
      }
      setContentStyle({
        position: "fixed",
        top: `${top}px`,
      });
    } else {
      switch (side) {
        case "top":
          top = triggerRect.top - contentHeight - sideOffset;
          break;
        case "bottom":
          top = triggerRect.bottom + sideOffset;
          break;
        case "left":
          desktopLeft = triggerRect.left - contentWidth - sideOffset;
          break;
        case "right":
          desktopLeft = triggerRect.right + sideOffset;
          break;
      }

      if (side === "top" || side === "bottom") {
        switch (align) {
          case "start":
            desktopLeft = triggerRect.left;
            break;
          case "center":
            desktopLeft = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
            break;
          case "end":
            desktopLeft = triggerRect.right - contentWidth;
            break;
        }
      } else {
        switch (align) {
          case "start":
            top = triggerRect.top;
            break;
          case "center":
            top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
            break;
          case "end":
            top = triggerRect.bottom - contentHeight;
            break;
        }
      }

      if (desktopLeft < sideOffset) desktopLeft = sideOffset;
      if (top < sideOffset) top = sideOffset;
      if (desktopLeft + contentWidth > viewportWidth - sideOffset) {
        desktopLeft = viewportWidth - contentWidth - sideOffset;
      }
      if (top + contentHeight > viewportHeight - sideOffset) {
        top = viewportHeight - contentHeight - sideOffset;
      }
      setContentStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${desktopLeft}px`,
      });
    }
  }, [open, side, sideOffset, align, isMobile]);

  useEffect(() => {
    if (open) {
      updatePosition();
      const rafId = requestAnimationFrame(() => {
        updatePosition();
      });

      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  const popoverAnimationVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 0,
    },
  };

  const transition = { duration: 0.2 };

  return (
    <>
      <div ref={triggerRef} onClick={() => onOpenChange(!open)} style={{ display: "inline-block", cursor: "pointer" }}>
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            ref={contentRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={popoverAnimationVariants}
            transition={transition}
            style={contentStyle}
            className={cn(
              "z-50 outline-none shadow-floating rounded-md fixed",
              {
                "origin-bottom": side === "top",
                "origin-top": side === "bottom" || !["top", "bottom", "left", "right"].includes(side), // Default to top if side is invalid
                "origin-right": side === "left",
                "origin-left": side === "right",
              },
              "w-auto max-w-xs left-auto sm:translate-x-0",
              isMobile && "w-[96vw] max-w-none left-2 right-2",
              contentClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
