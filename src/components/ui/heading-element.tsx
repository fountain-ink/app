"use client";

import { withRef, withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";
import { PlateElement } from "@udecode/plate/react";

const headingVariants = cva("relative mb-1", {
  variants: {
    variant: {
      h1: "mt-[1.6em] pb-1 font-heading text-4xl font-bold",
      h2: "mt-[1.4em] pb-px font-heading text-2xl font-semibold tracking-tight",
      h3: "mt-[1em] pb-px font-heading text-xl font-semibold tracking-tight",
      h4: "mt-[0.75em] font-heading text-lg font-semibold tracking-tight",
      h5: "mt-[0.75em] text-lg font-semibold tracking-tight",
      h6: "mt-[0.75em] text-base font-semibold tracking-tight",
    },
  },
});

const HeadingElementVariants = withVariants(PlateElement, headingVariants, ["variant"]);

export function HeadingElement({
  children,
  element,
  variant = "h1",
  attributes,
  ...props
}: React.ComponentProps<typeof HeadingElementVariants> & {
  variant?: "h1" | "h2" | "h3";
}) {
  return (
    <HeadingElementVariants
      attributes={{
        id: element.id as string,
        ...attributes,
      }}
      as={variant}
      variant={variant}
      element={element}
      {...props}
    >
      {children}
    </HeadingElementVariants>
  );
}
