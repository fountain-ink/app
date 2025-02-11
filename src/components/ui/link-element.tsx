"use client";

import type { TLinkElement } from "@udecode/plate-link";

import { cn, withRef } from "@udecode/cn";
import { useElement } from "@udecode/plate/react";
import { useLink } from "@udecode/plate-link/react";

import { PlateElement } from "./plate-element";

export const LinkElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const element = useElement<TLinkElement>();
  const { props: linkProps } = useLink({ element });

  return (
    <PlateElement
      ref={ref}
      as="a"
      className={cn("text-secondary underline not-prose decoration-secondary underline-offset-4", className)}
      {...(linkProps as any)}
      {...props}
    >
      {children}
    </PlateElement>
  );
});
