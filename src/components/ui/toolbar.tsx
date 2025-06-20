"use client";

import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cn, withCn, withRef, withVariants } from "@udecode/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Separator } from "./separator";
import { withTooltip } from "./tooltip";

const toolbarVariants = cva("relative flex select-none items-center", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "bg-popover rounded-sm",
      media:
        "absolute z-[2] h-[26px] max-w-[calc(100%-16px)] overflow-hidden rounded-sm bg-black/60 transition-opacity",
    },
  },
});

export const Toolbar = withVariants(ToolbarPrimitive.Root, toolbarVariants, ["variant"]);

export const ToolbarToggleGroup = withCn(ToolbarPrimitive.ToolbarToggleGroup, "flex items-center");

export const ToolbarLink = withCn(ToolbarPrimitive.Link, "font-medium underline underline-offset-4");

export const ToolbarSeparator = withCn(ToolbarPrimitive.Separator, "mx-2 my-1 w-px shrink-0 bg-border");

export const toolbarButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-bg-ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([data-icon])]:size-4",
  {
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-3",
        lg: "h-11 px-5",
        none: "",
        sm: "h-[28px] px-1.5",
        icon: "h-10 w-10 [&_svg]:size-5 ",
      },
      variant: {
        default:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-checked:bg-accent aria-checked:text-accent-foreground",
        media:
          "no-focus-ring m-0 h-auto rounded-none bg-black/20 px-1.5 py-1 text-white hover:bg-white/5 focus:bg-white/5 [&:not(:last-child)]:border-r [&:not(:last-child)]:border-r-white/20 [&_svg]:size-[14px] [&_svg]:text-white",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        muted: "text-muted-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
    },
  },
);

const ToolbarButton = withTooltip(
  React.forwardRef<
    React.ElementRef<typeof ToolbarToggleItem>,
    {
      isDropdown?: boolean;
      pressed?: boolean;
    } & Omit<React.ComponentPropsWithoutRef<typeof ToolbarToggleItem>, "asChild" | "value"> &
      VariantProps<typeof toolbarButtonVariants>
  >(({ children, className, isDropdown, pressed, size, variant, ...props }, ref) => {
    return typeof pressed === "boolean" ? (
      <ToolbarToggleGroup disabled={props.disabled} value="single" type="single">
        <ToolbarToggleItem
          ref={ref}
          className={cn(
            toolbarButtonVariants({
              size,
              variant,
            }),
            isDropdown && "justify-between gap-0.5 pr-1",
            className,
          )}
          value={pressed ? "single" : ""}
          {...props}
        >
          {isDropdown ? (
            <>
              <div className="flex flex-1 items-center gap-1 whitespace-nowrap">{children}</div>
              <div>
                <ChevronDownIcon className="size-3.5 text-muted-foreground/70" data-icon />
              </div>
            </>
          ) : (
            children
          )}
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    ) : (
      <ToolbarPrimitive.Button
        ref={ref}
        className={cn(
          toolbarButtonVariants({
            size,
            variant,
          }),
          isDropdown && "pr-1",
          className,
        )}
        {...props}
      >
        {children}
      </ToolbarPrimitive.Button>
    );
  }),
);
ToolbarButton.displayName = "ToolbarButton";

export { ToolbarButton };

export const ToolbarToggleItem = withVariants(ToolbarPrimitive.ToggleItem, toolbarButtonVariants, ["variant", "size"]);

export const ToolbarGroup = withRef<"div">(({ children, className }, ref) => {
  const childArr = React.Children.map(children, (c) => c);

  if (!childArr || childArr.length === 0) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "group/toolbar-group relative flex shrink-0",
        // 'hidden has-[button]:flex',
        className,
      )}
    >
      <div className="flex items-center gap-0.5">{children}</div>

      <div className="mx-1.5 hidden py-0.5 group-last/toolbar-group:!hidden group-has-[button]/toolbar-group:block">
        <Separator orientation="vertical" />
      </div>
    </div>
  );
});
