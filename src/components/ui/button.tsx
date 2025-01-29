"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn, withProps, withRef } from "@udecode/cn";
import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { LoadingSpinner } from "../misc/loading-spinner";
import { withTooltip } from "./tooltip";

export const buttonVariants = cva(
  "inline-flex focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-transparent focus:ring-offset-0 ring-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 outline-none w-fit cursor-pointer select-none items-center justify-center gap-2 rounded-md text-sm transition-bg-ease disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      truncate: true,
      variant: "default",
    },
    variants: {
      muted: {
        true: "text-muted hover:text-muted-foreground",
      },
      active: {
        false: "",
        true: "border-2 border-primary",
      },
      disabled: {
        true: "pointer-events-none opacity-50",
      },
      focused: {
        true: "outline outline-2 outline-border outline-offset-2",
      },
      isMenu: {
        true: "h-auto w-full cursor-pointer justify-start",
      },
      size: {
        blockAction: "size-[26px] gap-1 px-1.5 text-xs",
        default: "h-10 px-4 py-2 gap-2",
        icon: "h-10 w-10 [&_svg]:size-5",
        iconSm: "h-8 w-8",
        lg: "h-11 px-4 text-lg",
        md: "h-8 px-3",
        sm: "h-8 px-2",
        menuAction: "size-6",
        navAction: "size-5",
        none: "",
        xs: "h-5 px-1.5 py-1 text-xs",
      },
      truncate: {
        true: "truncate whitespace-nowrap",
      },
      variant: {
        default: "bg-primary font-medium text-primary-foreground hover:bg-primary/90 [&_svg]:text-primary-foreground",
        blockAction: "rounded-sm hover:bg-primary/[.06] [&_svg]:text-muted-foreground",
        blockActionSecondary: "rounded-sm bg-primary/[.06] [&_svg]:text-muted-foreground",
        brand: "bg-primary font-medium text-white hover:bg-primary/80 active:bg-primary-active",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 [&_svg]:text-destructive-foreground",
        muted: "text-muted-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        ghost2: "text-muted-foreground hover:bg-accent",
        ghost3: "text-muted-foreground/80 hover:bg-accent",
        ghostText: "hover:text-accent-foreground",
        ghostActive: "bg-accent hover:bg-accent hover:text-accent-foreground",
        menuAction: "text-muted-foreground/80 hover:bg-primary/[.06]",
        nav: "rounded-sm text-muted-foreground transition hover:bg-primary/[.04]",
        navAction:
          "rounded-sm text-muted-foreground/80 opacity-0 transition hover:bg-primary/[.06] group-hover:opacity-100",
        none: "",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        primaryOutline:
          "border border-primary-foreground text-primary-foreground hover:bg-accent/15 [&_svg]:text-primary-foreground",
        radio: "border-2 border-input hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
  },
);

export type ButtonProps = ComponentProps<typeof Button>;

export type ButtonExtendedProps = {
  active?: boolean;
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: "left" | "right";
  isPending?: boolean;
  loading?: boolean;
  loadingClassName?: string;
  onToggleClick?: () => void;
} & {
  children?: React.ReactNode;
  label?: string;
} & VariantProps<typeof buttonVariants>;

export const Button = withTooltip(
  withRef<"button", ButtonExtendedProps>(
    (
      {
        active,
        asChild = false,
        children,
        className,
        focused,
        icon,
        iconPlacement = "left",
        isMenu,
        isPending,
        label,
        loading,
        loadingClassName,
        size,
        truncate,
        variant,
        onToggleClick,
        ...props
      },
      ref,
    ) => {
      const Comp = asChild ? Slot : "button";

      return (
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({
              disabled: props.disabled,
              focused,
              isMenu,
              size,
              truncate,
              variant,
            }),
            active && "border-0 border-primary",
            className,
          )}
          aria-label={label && label.length > 0 ? label : undefined}
          type={Comp === "button" ? "button" : undefined}
          {...props}
        >
          {icon && iconPlacement === "left" && icon}

          {loading && <LoadingSpinner />}

          {children}

          {icon && iconPlacement === "right" && icon}
        </Comp>
      );
    },
  ),
);

export type LinkButtonProps = ComponentProps<typeof LinkButton>;

export const LinkButton = withTooltip(
  withProps(
    withRef<typeof Link, ButtonExtendedProps>(
      (
        {
          active,
          children,
          className,
          focused,
          icon,
          iconPlacement = "left",
          isMenu,
          label,
          loading,
          loadingClassName,
          size,
          truncate,
          variant,
          ...props
        },
        ref,
      ) => {
        return (
          <Link
            ref={ref}
            className={cn(
              buttonVariants({
                disabled: props.disabled,
                focused,
                isMenu,
                size,
                truncate,
                variant,
              }),
              active && "border-2 border-primary",
              className,
            )}
            aria-label={label && label.length > 0 ? label : undefined}
            prefetch={false}
            role="button"
            {...props}
          >
            {icon && iconPlacement === "left" && <div className="shrink-0">{icon}</div>}

            {loading && <LoadingSpinner />}

            {children}

            {icon && iconPlacement === "right" && icon}
          </Link>
        );
      },
    ),
    {
      variant: "ghost",
    },
  ),
);
