"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScroll } from "@/hooks/use-scroll";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Share2, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

type ActionState = {
  isActive: boolean;
  count: number;
  isHovered: boolean;
};

type ActionButton = {
  icon: any;
  label: string;
  initialCount: number;
  color?: string;
  fillOnActive?: boolean;
};

const actionButtons: ActionButton[] = [
  {
    icon: Heart,
    label: "Like",
    initialCount: 1240,
    color: "rgb(195,120,146)",
    fillOnActive: true,
  },
  {
    icon: Bookmark,
    label: "Bookmark",
    initialCount: 5600,
    color: "rgb(192,148,204)",
    fillOnActive: true,
  },
  {
    icon: ShoppingBag,
    label: "Collect",
    initialCount: 23,
    color: "rgb(254,178,4)",
    fillOnActive: false,
  },
  {
    icon: MessageCircle,
    label: "Comment",
    initialCount: 8900,
    color: "rgb(189, 204, 233)",
    fillOnActive: true,
  },
  {
    icon: Share2,
    label: "Share",
    initialCount: 120,
    color: "rgb(155, 179, 223)",
    fillOnActive: true,
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toString();
};

const CounterAnimation = ({
  value,
  prevValue,
  color,
}: {
  value: number;
  prevValue: number;
  color?: string;
}) => {
  const isIncreasing = value > prevValue;
  const formattedValue = formatNumber(value);

  return (
    <motion.span
      key={value}
      initial={{ y: isIncreasing ? 20 : -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: isIncreasing ? -20 : 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute"
      style={{ color }}
    >
      {formattedValue}
    </motion.span>
  );
};

export const Footer = () => {
  const isVisible = useScroll();
  const [actionStates, setActionStates] = useState<ActionState[]>(
    actionButtons.map((button) => ({
      isActive: false,
      count: button.initialCount,
      isHovered: false,
    })),
  );

  const previousCounts = useRef<number[]>(actionButtons.map((button) => button.initialCount));

  useEffect(() => {
    previousCounts.current = actionStates.map((state) => state.count);
  }, [actionStates]);

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

  const handleClick = (index: number) => {
    setActionStates((prevStates) => {
      const newStates = [...prevStates];
      const currentState = newStates[index];
      if (!currentState) return prevStates;

      newStates[index] = {
        ...currentState,
        isActive: !currentState.isActive,
        count: currentState.isActive ? currentState.count - 1 : currentState.count + 1,
      };
      return newStates;
    });
  };

  const handleHover = (index: number, isHovered: boolean) => {
    setActionStates((prevStates) => {
      const newStates = [...prevStates];
      const currentState = newStates[index];
      if (!currentState) return prevStates;

      newStates[index] = {
        ...currentState,
        isHovered,
      };
      return newStates;
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        style={{ y }}
        className="fixed bottom-6  z-[40] px-6 py-3
          rounded-full backdrop-blur-xl bg-background/40 border border-border
          shadow-lg w-fit max-w-[90vw]"
      >
        <nav className="flex items-center gap-6">
          {actionButtons.map((button, index) => {
            const Icon = button.icon;
            const state = actionStates[index];
            if (!state) return null;

            return (
              <Tooltip key={button.label}>
                <TooltipTrigger asChild>
                  <div className="group flex items-center gap-1.5">
                    <Button
                      variant="ghost3"
                      onClick={() => handleClick(index)}
                      onMouseEnter={() => handleHover(index, true)}
                      onMouseLeave={() => handleHover(index, false)}
                      style={{
                        color: state.isActive || state.isHovered ? button.color : undefined,
                        backgroundColor: state.isActive ? `${button.color}10` : undefined,
                      }}
                      className="flex items-center transition-all duration-200
                        text-muted-foreground rounded-full p-2 w-10 h-10
                        focus:outline-none group-hover:bg-transparent"
                    >
                      <Icon
                        size={20}
                        className={`transition-all duration-200 group-hover:scale-110 group-active:scale-95
                          ${state.isActive && button.fillOnActive ? "fill-current" : ""}`}
                        style={{
                          color: state.isActive || state.isHovered ? button.color : undefined,
                        }}
                      />
                    </Button>
                    <div className="relative h-5 overflow-visible min-w-[24px] flex justify-start items-center text-sm text-muted-foreground -ml-2">
                      <AnimatePresence>
                        <CounterAnimation
                          value={state.count}
                          prevValue={previousCounts.current[index] ?? state.count}
                          color={state.isActive ? "var(--primary-foreground)" : "var(--muted-foreground)"}
                        />
                      </AnimatePresence>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-center">
                    <span>{button.label}</span>
                    <span className="text-xs text-muted-foreground">{state.count.toLocaleString()}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </motion.div>
    </TooltipProvider>
  );
};
