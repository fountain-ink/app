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
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

export const ActionButton = ({
  icon: Icon,
  label,
  initialCount = 0,
  strokeColor,
  fillColor,
  dropdownItems,
  className,
  showChevron = true,
}: ActionButtonProps) => {
  const [state, setState] = useState({
    isActive: false,
    count: initialCount,
    isHovered: false,
  });

  const previousCount = useRef(initialCount);

  useEffect(() => {
    previousCount.current = state.count;
  }, [state.count]);

  const handleClick = () => {
    setState((prev) => ({
      ...prev,
      isActive: !prev.isActive,
      count: prev.isActive ? prev.count - 1 : prev.count + 1,
    }));
  };

  const handleHover = (isHovered: boolean) => {
    setState((prev) => ({ ...prev, isHovered }));
  };

  const iconProps = {
    size: 20,
    strokeWidth: 1.5,
    className: "transition-all duration-200 group-hover:scale-110 group-active:scale-95",
    style: {
      color: state.isActive || state.isHovered ? strokeColor : undefined,
      fill: state.isActive ? fillColor : undefined,
    },
  };

  const ButtonContent = (
    <div
      className={`group flex items-center cursor-pointer ${className}`}
      onClick={() => !dropdownItems && handleClick()}
    >
      {dropdownItems ? (
        <DropdownMenu onOpenChange={(open) => setState((prev) => ({ ...prev, isActive: open }))}>
          <DropdownMenuTrigger className="flex items-center gap-0.5">
            <div className="relative">
              <ButtonHoverEffect isHovered={state.isHovered} strokeColor={strokeColor} />
              <Button
                variant="ghost3"
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
                style={{
                  backgroundColor: state.isActive ? `${strokeColor}10` : undefined,
                }}
                className="flex items-center transition-all duration-200 text-foreground rounded-full p-0 w-10 h-10
                          focus:outline-none group-hover:bg-transparent relative"
              >
                <Icon {...iconProps} />
              </Button>
            </div>
            {showChevron && (
              <motion.div
                initial={false}
                animate={{ rotate: state.isActive ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, mass: 2 }}
              >
                <ChevronDown
                  size={16}
                  style={{
                    color: state.isActive || state.isHovered ? strokeColor : undefined,
                  }}
                />
              </motion.div>
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
              backgroundColor: state.isActive ? `${strokeColor}10` : undefined,
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
                strokeColor={state.isActive ? "var(--primary-foreground)" : "var(--primary-foreground)"}
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
