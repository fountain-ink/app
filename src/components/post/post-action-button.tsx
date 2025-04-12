"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, ReactElement, JSXElementConstructor } from "react";
import { AnimatedChevron } from "../ui/animated-chevron";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type DropdownItem = {
  icon: any;
  label: string;
  onClick: () => void;
};

export type ActionButtonProps = {
  icon: LucideIcon | IconType | React.FC<any>;
  label: string;
  initialCount: number;
  strokeColor: string;
  fillColor: string;
  isActive?: boolean;
  shouldIncrementOnClick: boolean;
  onClick?: () => Promise<any> | undefined;
  renderPopover?: (trigger: ReactElement) => ReactElement;
  isDisabled?: boolean;
  dropdownItems?: {
    icon: LucideIcon | IconType | React.FC<any>;
    label: string;
    onClick: () => void;
  }[];
  hideCount?: boolean;
  className?: string;
  showChevron?: boolean;
  fillOnHover?: boolean;
  fillOnClick?: boolean;
};

const formatNumber = (num: number): string => {
  if (num === 0 || !num) return "";
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
  initialCount,
  strokeColor,
  fillColor,
  isActive = false,
  shouldIncrementOnClick,
  onClick,
  renderPopover,
  isDisabled = false,
  dropdownItems,
  hideCount = false,
  className,
  showChevron = false,
  fillOnHover = true,
  fillOnClick = true,
}: ActionButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { open, onOpenChange } = useOpenState();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || !onClick) return;

    e.stopPropagation();

    try {
      await onClick();
    } catch (error) {
      console.error(`Action button "${label}" failed:`, error);
    }
  };

  const handleHover = (hovering: boolean) => {
    if (!isDisabled) {
      setIsHovered(hovering);
    }
  };

  const iconProps = {
    size: 20,
    strokeWidth: 1.5,
    className: "transition-all duration-200 group-hover:scale-110 group-active:scale-95",
    style: {
      color: isDisabled
        ? "hsl(var(--muted-foreground))"
        : isActive
          ? strokeColor
          : isHovered
            ? strokeColor
            : undefined,
      fill: isDisabled
        ? undefined
        : isActive && fillOnClick
          ? fillColor
          : undefined,
      opacity: isDisabled ? 0.5 : 1,
    },
  };

  const TriggerButton = (
    <div className="relative">
      <ButtonHoverEffect isHovered={isHovered} strokeColor={strokeColor} />
      <Button
        variant="ghost3"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{
          backgroundColor: isActive ? `${strokeColor}10` : undefined,
        }}
        onClick={handleClick}
        className="flex items-center transition-all duration-200 text-foreground rounded-full p-0 w-10 h-10
                  focus:outline-none group-hover:bg-transparent relative"
      >
        <Icon {...iconProps} />
      </Button>
    </div>
  );

  const ButtonContent = (
    <div
      className={`group flex items-center ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${className}`}
    >
      {renderPopover ? (
        renderPopover(TriggerButton)
      ) : dropdownItems ? (
        <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
          <DropdownMenuTrigger
            className="flex items-center gap-0.5 outline-none"
          >
            <div className="flex items-center gap-0.5">
              {TriggerButton}
              {showChevron && (
                <AnimatedChevron
                  isOpen={isActive}
                  color={isActive || isHovered ? strokeColor : undefined}
                  direction="up"
                />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top">
            {dropdownItems?.map((item) => (
              <DropdownMenuItem key={item.label} onClick={item.onClick} className="gap-1 rounded-sm mx-0 w-full">
                <item.icon className="w-4 h-4" /> {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        TriggerButton
      )}
      {!hideCount && (
        <div className="relative h-5 flex items-center text-xs text-foreground -ml-1">
          <div className="opacity-0">{formatNumber(initialCount)}</div>
          <div className="absolute inset-0 flex items-center">
            <AnimatePresence>
              <CounterAnimation
                value={initialCount}
                strokeColor={isActive ? strokeColor : undefined}
              />
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );

  const triggerElement = (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
        <TooltipContent side="bottom" className="bg-foreground text-background text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (renderPopover) {
    return renderPopover(triggerElement);
  }

  if (dropdownItems && dropdownItems.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{triggerElement}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {dropdownItems.map((item) => (
            <DropdownMenuItem key={item.label} onClick={item.onClick}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return triggerElement;
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
  strokeColor,
}: {
  value: number;
  strokeColor?: string;
}) => {
  const formattedValue = formatNumber(value);

  if (!formattedValue) return null;

  return (
    <motion.span
      key={value}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute"
      style={{ color: strokeColor }}
    >
      {formattedValue}
    </motion.span>
  );
};
