"use client";

import { withRef, withVariants } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";
import { cva } from "class-variance-authority";

const listVariants = cva("m-0", {
  variants: {
    variant: {
      ol: "list-decimal [&_ul]:list-[circle] [&_ul_ul]:list-[square]",
      ul: "list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]",
    },
  },
});

const ListElementVariants = withVariants(PlateElement, listVariants, ["variant"]);

export const ListElement = withRef<typeof ListElementVariants>(({ children, variant = "ul", ...props }, ref) => {
  return (
    <ListElementVariants ref={ref} as={variant ?? "ul"} variant={variant} {...props}>
      {children}
    </ListElementVariants>
  );
});
