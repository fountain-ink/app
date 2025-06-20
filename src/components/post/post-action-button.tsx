"use client";

import { useModal } from "connectkit";
import { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactElement, useState } from "react";
import { IconType } from "react-icons";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/ui-store";
import { AnimatedChevron } from "../ui/animated-chevron";

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
  onClick?: () => Promise<any> | undefined | undefined;
  renderPopover?: (trigger: ReactElement) => ReactElement;
  isDisabled?: boolean;
  isUserLoggedIn?: boolean;
  dropdownItems?: DropdownItem[];
  hideCount?: boolean;
  className?: string;
  showChevron?: boolean;
  fillOnHover?: boolean;
  fillOnClick?: boolean;
};

const TooltipWrapper = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="bg-foreground text-background text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ActionButton = ({
  icon: Icon,
  label,
  initialCount,
  strokeColor,
  fillColor,
  isActive = false,
  onClick,
  renderPopover,
  isDisabled = false,
  isUserLoggedIn,
  dropdownItems,
  hideCount = false,
  className,
  showChevron = false,
  fillOnClick = true,
}: ActionButtonProps) => {
  const setProfileSelectModalOpen = useUIStore((state) => state.setProfileSelectModalOpen);
  const { setOpen: openConnectKitModal, open: openConnectKitModalOpen } = useModal();
  const { isConnected: isWalletConnected } = useAccount();
  const [isHovered, setIsHovered] = useState(false);
  const { open, onOpenChange } = useOpenState();

  const effectiveIsDisabled = isUserLoggedIn ? isDisabled : false;
  const showLoginActions = !isUserLoggedIn;

  const connectWalletHandler = () => {
    openConnectKitModal(true);
  };

  const selectProfileHandler = () => {
    setProfileSelectModalOpen(true);
  };

  const showLoginModal = () => {
    if (!isWalletConnected) {
      connectWalletHandler();
    } else {
      selectProfileHandler();
    }
  };

  const handleClick = async (_e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (showLoginActions) {
      showLoginModal();
      return;
    }

    if (isDisabled || !onClick) return;
    try {
      await onClick();
    } catch (error) {
      console.error(`Action button "${label}" failed:`, error);
    }
  };

  const handleHover = (hovering: boolean) => {
    if (isUserLoggedIn && isDisabled) {
      setIsHovered(false);
      return;
    }
    setIsHovered(hovering);
  };

  let iconStyleColor;
  let iconStyleFill;
  let iconOpacityStyle;
  let buttonBgStyle;
  let divCursorStyle;
  let divOpacityClass;

  if (showLoginActions) {
    iconStyleColor = isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))";
    iconStyleFill = undefined;
    iconOpacityStyle = 1;
    buttonBgStyle = undefined;
    divCursorStyle = "cursor-pointer";
    divOpacityClass = "";
  } else {
    iconStyleColor = isDisabled
      ? "hsl(var(--muted-foreground))"
      : isActive
        ? strokeColor
        : isHovered
          ? strokeColor
          : undefined;
    iconStyleFill = isDisabled ? undefined : isActive && fillOnClick ? fillColor : undefined;
    iconOpacityStyle = isDisabled ? 0.5 : 1;
    buttonBgStyle = isActive ? `${strokeColor}10` : undefined;
    divCursorStyle = isDisabled ? "cursor-not-allowed" : "cursor-pointer";
    divOpacityClass = isDisabled ? "opacity-70" : "";
  }

  const iconProps = {
    size: 20,
    strokeWidth: 1.5,
    className: "transition-all duration-200 group-hover:scale-110 group-active:scale-95",
    style: {
      color: iconStyleColor,
      fill: iconStyleFill,
      opacity: iconOpacityStyle,
    },
  };

  const MainButton = (
    <div className="relative">
      <ButtonHoverEffect
        isHovered={isHovered && !effectiveIsDisabled && (isUserLoggedIn || isHovered)}
        strokeColor={isUserLoggedIn ? strokeColor : "hsl(var(--primary))"}
      />
      <Button
        variant="ghost3"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{ backgroundColor: buttonBgStyle }}
        onClick={handleClick}
        disabled={isUserLoggedIn && isDisabled}
        className="flex items-center transition-all duration-200 text-foreground rounded-full p-0 w-10 h-10 focus:outline-none group-hover:bg-transparent relative"
      >
        <Icon {...iconProps} />
      </Button>
    </div>
  );

  const CountDisplay = !hideCount && (
    <div className="relative h-5 flex items-center text-xs text-foreground -ml-1">
      <div className="opacity-0">{formatNumber(initialCount)}</div>
      <div className="absolute inset-0 flex items-center">
        <AnimatePresence>
          <CounterAnimation value={initialCount} strokeColor={isUserLoggedIn && isActive ? strokeColor : undefined} />
        </AnimatePresence>
      </div>
    </div>
  );

  const divWrapperClassName = `group flex items-center ${divCursorStyle} ${divOpacityClass} ${className || ""}`.trim();

  if (renderPopover) {
    return renderPopover(
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          handleClick(e);
        }}
        className={divWrapperClassName}
      >
        <TooltipWrapper label={label}>{MainButton}</TooltipWrapper>
        {CountDisplay}
      </div>,
    );
  }

  if (dropdownItems && dropdownItems.length > 0) {
    return (
      <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <div className={divWrapperClassName}>
            <TooltipWrapper label={label}>{MainButton}</TooltipWrapper>
            {showChevron && (
              <AnimatedChevron
                isOpen={open}
                color={
                  isUserLoggedIn && isHovered && !isDisabled
                    ? strokeColor
                    : showLoginActions && isHovered
                      ? "hsl(var(--primary))"
                      : undefined
                }
                direction="up"
              />
            )}
            {CountDisplay}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top">
          {dropdownItems.map((item) => (
            <DropdownMenuItem key={item.label} onClick={item.onClick} className="gap-2 px-2 rounded-sm mx-0 w-full">
              <item.icon className="w-4 h-4" /> {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipWrapper label={label}>
      <div className={divWrapperClassName}>
        {MainButton}
        {CountDisplay}
      </div>
    </TooltipWrapper>
  );
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

const ButtonHoverEffect = ({ isHovered, strokeColor }: { isHovered: boolean; strokeColor: string }) => {
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

const CounterAnimation = ({ value, strokeColor }: { value: number; strokeColor?: string }) => {
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
