"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatedChevron } from "../ui/animated-chevron";

export type DropdownItem = {
  icon: any;
  label: string;
  onClick: () => void;
};

export type ActionButtonProps = {
  icon: any;
  label: string;
  initialCount?: number;
  strokeColor: string;
  fillColor: string;
  dropdownItems?: DropdownItem[];
  className?: string;
  showChevron?: boolean;
  onClick?: () => Promise<any> | undefined;
  isActive?: boolean;
  shouldIncrementOnClick?: boolean;
};

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

export const ActionButton = ({
  icon: Icon,
  label,
  initialCount = 0,
  strokeColor,
  fillColor,
  dropdownItems,
  className,
  showChevron = false,
  onClick,
  isActive = false,
  shouldIncrementOnClick = true,
}: ActionButtonProps) => {
  const [state, setState] = useState({
    count: initialCount,
    isHovered: false,
    isPressedLocally: isActive,
  });

  // Keep local state in sync with prop for URL-based states (comment/collect)
  useEffect(() => {
    setState(prev => ({ ...prev, isPressedLocally: isActive }));
  }, [isActive]);

  const previousCount = useRef(initialCount);

  useEffect(() => {
    previousCount.current = state.count;
  }, [state.count]);

  const handleClick = async () => {
    if (onClick) {
      if (!dropdownItems) {
        setState((prev) => ({
          ...prev,
          isPressedLocally: !prev.isPressedLocally,
          count: shouldIncrementOnClick ? (!prev.isPressedLocally ? prev.count + 1 : prev.count - 1) : prev.count,
        }));
      }

      try {
        await onClick();
      } catch (error) {
        // Revert the optimistic update on error
        if (!dropdownItems) {
          setState((prev) => ({
            ...prev,
            isPressedLocally: !prev.isPressedLocally,
            count: shouldIncrementOnClick ? (prev.isPressedLocally ? prev.count + 1 : prev.count - 1) : prev.count,
          }));
        }
        console.error("Error in action button click:", error);
      }
    }
  };

  const handleHover = (isHovered: boolean) => {
    setState((prev) => ({ ...prev, isHovered }));
  };

  const iconProps = {
    size: 20,
    strokeWidth: 1.5,
    className: "transition-all duration-200 group-hover:scale-110 group-active:scale-95",
    style: {
      color: state.isPressedLocally || state.isHovered ? strokeColor : undefined,
      fill: state.isPressedLocally ? fillColor : undefined,
    },
  };

  const ButtonContent = (
    <div
      className={`group flex items-center cursor-pointer ${className}`}
      onClick={() => !dropdownItems && handleClick()}
    >
      {dropdownItems ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-0.5">
            <div className="relative">
              <ButtonHoverEffect isHovered={state.isHovered} strokeColor={strokeColor} />
              <Button
                variant="ghost3"
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
                style={{
                  backgroundColor: state.isPressedLocally ? `${strokeColor}10` : undefined,
                }}
                className="flex items-center transition-all duration-200 text-foreground rounded-full p-0 w-10 h-10
                          focus:outline-none group-hover:bg-transparent relative"
              >
                <Icon {...iconProps} />
              </Button>
            </div>
            {showChevron && (
              <AnimatedChevron
                isOpen={state.isPressedLocally}
                color={state.isPressedLocally || state.isHovered ? strokeColor : undefined}
                direction="up"
              />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {dropdownItems?.map((item) => (
              <DropdownMenuItem key={item.label} onClick={item.onClick} className="gap-1 rounded-sm mx-0 w-full">
                <item.icon className="w-4 h-4" /> {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="relative">
          <ButtonHoverEffect isHovered={state.isHovered} strokeColor={strokeColor} />
          <Button
            variant="ghost3"
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            style={{
              backgroundColor: state.isPressedLocally ? `${strokeColor}10` : undefined,
            }}
            className="flex items-center transition-all duration-200 text-foreground rounded-full p-0 w-10 h-10
                      focus:outline-none group-hover:bg-transparent relative"
          >
            <Icon {...iconProps} />
          </Button>
        </div>
      )}
      {!dropdownItems && (
        <div className="relative h-5 flex items-center text-xs text-foreground -ml-1">
          <div className="opacity-0">{formatNumber(state.count)}</div>
          <div className="absolute inset-0 flex items-center">
            <AnimatePresence>
              <CounterAnimation
                value={state.count}
                prevValue={previousCount.current}
                strokeColor={state.isPressedLocally ? strokeColor : undefined}
              />
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );

  return dropdownItems ? (
    ButtonContent
  ) : (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col items-center">
            <span>{label}</span>
            {state.count > 0 && <span className="text-xs text-foreground">{state.count.toLocaleString()}</span>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
      className="absolute inset-0 rounded-full"
      style={{ backgroundColor: strokeColor }}
    />
  );
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