"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScroll } from "@/hooks/use-scroll";
import { AnimatePresence, motion } from "framer-motion";
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
  strokeColor: string;
  fillColor: string;
  fillOnActive?: boolean;
  showCounter?: boolean;
};

const actionButtons: ActionButton[] = [
  {
    icon: Share2,
    label: "Share",
    initialCount: 0,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    fillOnActive: true,
    showCounter: false,
  },
  {
    icon: Bookmark,
    label: "Bookmark",
    initialCount: 5600,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    fillOnActive: true,
    showCounter: true,
  },
  {
    icon: ShoppingBag,
    label: "Collect",
    initialCount: 23,
    strokeColor: "rgb(254,178,4)",
    fillColor: "rgba(254, 178, 4, 0.3)",
    fillOnActive: false,
    showCounter: true,
  },
  {
    icon: MessageCircle,
    label: "Comment",
    initialCount: 8900,
    strokeColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary) / 0.8)",
    fillOnActive: true,
    showCounter: true,
  },
  {
    icon: Heart,
    label: "Like",
    initialCount: 124000,
    strokeColor: "rgb(215, 84, 127)",
    fillColor: "rgba(215, 84, 127, 0.9)",
    fillOnActive: true,
    showCounter: true,
  },
];

const formatNumber = (num: number): string => {
  if (num === 0) return "";
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
  strokeColor,
}: {
  value: number;
  prevValue: number;
  strokeColor?: string;
}) => {
  const isIncreasing = value > prevValue;
  const formattedValue = formatNumber(value);

  if (!formattedValue) return null;

  return (
    <motion.span
      key={value}
      initial={{ y: isIncreasing ? -30 : 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: isIncreasing ? 30 : -30, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute"
      style={{ color: strokeColor }}
    >
      {formattedValue}
    </motion.span>
  );
};

const ButtonHoverEffect = ({
  isHovered,
  strokeColor,
}: {
  isHovered: boolean;
  strokeColor: string;
}) => {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isHovered ? 1 : 0,
        opacity: isHovered ? 0.1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
      }}
      className="absolute inset-0 rounded-full "
      style={{ backgroundColor: strokeColor }}
    />
  );
};

export const Footer = () => {
  const { scrollProgress, shouldShow, shouldAnimate } = useScroll();
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

  const translateY = scrollProgress * 100; // 0px when visible, 100px when hidden

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
        className="fixed bottom-6 inset-x-0 mx-auto z-[40] pl-2 pr-4 py-0.5
           rounded-full backdrop-blur-xl bg-background/70 border border-border
           shadow-lg w-full max-w-[90vw] sm:max-w-[50vw] md:max-w-sm
           origin-bottom"
      >
        <nav className="flex items-center justify-between">
          {actionButtons.map((button, index) => {
            const Icon = button.icon;
            const state = actionStates[index];
            if (!state) return null;

            return (
              <Tooltip key={button.label}>
                <TooltipTrigger asChild>
                  <div className="group flex items-center gap-1.5">
                    <div className="relative">
                      <ButtonHoverEffect isHovered={state.isHovered} strokeColor={button.strokeColor} />
                      <Button
                        variant="ghost3"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleHover(index, true)}
                        onMouseLeave={() => handleHover(index, false)}
                        style={{
                          backgroundColor: state.isActive ? `${button.strokeColor}10` : undefined,
                        }}
                        className="flex items-center transition-all duration-200
                          text-foreground rounded-full p-0 w-10 h-10
                          focus:outline-none group-hover:bg-transparent
                          relative"
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.5}
                          className={`transition-all duration-200 group-hover:scale-110 group-active:scale-95 active:stroke-[${button.strokeColor}]`}
                          style={{
                            color: state.isActive || state.isHovered ? button.strokeColor : undefined,
                            fill: state.isActive ? button.fillColor : undefined,
                          }}
                        />
                      </Button>
                    </div>
                    {button.showCounter && (
                      <div className="relative h-5 flex items-center text-xs text-foreground -ml-2">
                        <div className="opacity-0">{formatNumber(state.count)}</div>
                        <div className="absolute inset-0 flex items-center">
                          <AnimatePresence>
                            <CounterAnimation
                              value={state.count}
                              prevValue={previousCounts.current[index] ?? state.count}
                              strokeColor={state.isActive ? "var(--primary-foreground)" : "var(--primary-foreground)"}
                            />
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-center">
                    <span>{button.label}</span>

                    {state.count > 0 && <span className="text-xs text-foreground">{state.count.toLocaleString()}</span>}
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
