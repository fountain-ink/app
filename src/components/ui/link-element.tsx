"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateElement, useElement } from "@udecode/plate/react";
import type { TLinkElement } from "@udecode/plate-link";
import { useLink } from "@udecode/plate-link/react";

export const LinkElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const element = useElement<TLinkElement>();
  const { props: linkProps } = useLink({ element });

  return (
    <PlateElement
      ref={ref}
      as="a"
      className={cn("text-foreground underline not-prose decoration-foreground underline-offset-4", className)}
      {...(linkProps as any)}
      {...props}
    >
      {children}
    </PlateElement>
  );
});
