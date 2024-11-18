"use client";

import * as React from "react";
import { useCallback, useState } from "react";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn, createPrimitiveElement, withCn, withRef, withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

export type DropdownMenuProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>;

export const DropdownMenu = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuGroup = withCn(DropdownMenuPrimitive.Group, "py-1.5");

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuSubTrigger = withRef<
  typeof DropdownMenuPrimitive.SubTrigger,
  {
    inset?: boolean;
  }
>(({ children, className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "mx-1 flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      "no-focus-ring",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}

    <ChevronRightIcon className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));

export const DropdownMenuSubContent = withCn(
  DropdownMenuPrimitive.SubContent,
  "z-50 min-w-32 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-floating data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
);

export const DropdownMenuContent = withRef<typeof DropdownMenuPrimitive.Content, { portal?: boolean }>(
  ({ className, portal, ...props }, ref) => {
    const content = (
      <DropdownMenuPrimitive.Content
        ref={ref}
        className={cn(
          "no-focus-ring z-50 min-w-32 max-w-[100vw] overflow-hidden rounded-lg bg-popover p-0 text-sm text-popover-foreground shadow-floating",
          "data-[state=closed]:hidden data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom data-[state=open]:animate-zoom",
          className,
        )}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        sideOffset={4}
        {...props}
      />
    );

    if (portal) {
      return <DropdownMenuPrimitive.Portal>{content}</DropdownMenuPrimitive.Portal>;
    }

    return content;
  },
);

export const dropdownMenuItemVariants = cva(
  cn(
    "no-focus-ring relative flex cursor-pointer select-none items-center gap-2 rounded-md align-middle text-sm transition-bg-ease data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle-foreground",
    "text-accent-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground",
  ),
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "mx-1 h-[28px] w-[calc(100%-8px)] px-2.5",
        none: "",
      },
      variant: {
        default: "focus:bg-accent focus:text-accent-foreground",
        none: "",
      },
    },
  },
);

export const DropdownMenuItem = withVariants(DropdownMenuPrimitive.Item, dropdownMenuItemVariants, ["size", "variant"]);

export const DropdownMenuCheckboxItem = withRef<typeof DropdownMenuPrimitive.CheckboxItem>(
  ({ children, className, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "no-focus-ring relative flex select-none items-center gap-2 rounded-sm py-1.5 pl-7 pr-2 transition-bg-ease focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "cursor-pointer",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>

      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  ),
);

export const DropdownMenuRadioItem = withRef<
  typeof DropdownMenuPrimitive.RadioItem,
  {
    hideIcon?: boolean;
  }
>(({ children, className, hideIcon, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "no-focus-ring relative flex select-none items-center rounded-sm pl-8 pr-2 transition-bg-ease focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "mx-1 h-[28px] cursor-pointer px-2.5 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&_svg]:size-4",
      className,
    )}
    {...props}
  >
    {!hideIcon && (
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    )}

    {children}
  </DropdownMenuPrimitive.RadioItem>
));

const dropdownMenuLabelVariants = cva(
  cn("mb-2 mt-1.5 cursor-default select-none px-[14px] text-xs font-medium text-muted-foreground"),
  {
    variants: {
      inset: {
        true: "pl-8",
      },
    },
  },
);

export const DropdownMenuLabel = withVariants(DropdownMenuPrimitive.Label, dropdownMenuLabelVariants, ["inset"]);

export const DropdownMenuSeparator = withCn(DropdownMenuPrimitive.Separator, "-mx-1 my-1 h-px bg-muted");

export const DropdownMenuShortcut = withCn(
  createPrimitiveElement("span"),
  "ml-auto text-xs tracking-widest opacity-60",
);

export const useOpenState = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open],
  );

  return {
    open,
    onOpenChange,
  };
};
