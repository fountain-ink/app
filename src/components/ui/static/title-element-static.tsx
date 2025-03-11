import React from "react";
import type { SlateElementProps } from "@udecode/plate";
import { cn } from "@udecode/cn";
import { SlateElement } from "@udecode/plate";
import { cva } from "class-variance-authority";

const titleVariants = cva("relative", {
  variants: {
    variant: {
      title: "title",
      subtitle: "subtitle",
    },
  },
});

export const TitleElementStatic = ({
  children,
  className,
  variant = "title",
  ...props
}: SlateElementProps & { variant?: "title" | "subtitle" }) => {
  return (
    <SlateElement
      className={cn(className, titleVariants({ variant }), "my-px px-0.5 py-[3px]")}
      style={{
        ...props.style,
        backgroundColor: props.element.backgroundColor as any,
      }}
      as="header"
      {...props}
    >
      {children}
    </SlateElement>
  );
};

export const SubtitleElementStatic = ({
  children,
  className,
  variant = "subtitle",
  ...props
}: SlateElementProps & { variant?: "title" | "subtitle" }) => {
  return (
    <SlateElement
      className={cn(className, titleVariants({ variant }), "my-px px-0.5 py-[3px]")}
      style={{
        ...props.style,
        backgroundColor: props.element.backgroundColor as any,
      }}
      as="header"
      {...props}
    >
      {children}
    </SlateElement>
  );
};
