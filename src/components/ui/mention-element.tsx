"use client";

import { cn, withRef } from "@udecode/cn";
import { getHandler, IS_APPLE } from "@udecode/plate";
import { PlateElement, useElement, useFocused, useSelected } from "@udecode/plate/react";
import type { TMentionElement } from "@udecode/plate-mention";
import React from "react";
import { useMounted } from "@/hooks/use-mounted";
import { UserLazyUsername } from "../user/user-lazy-username";

export const MentionElement = withRef<
  typeof PlateElement,
  {
    prefix?: string;
    renderLabel?: (mentionable: TMentionElement) => string;
    onClick?: (mentionNode: any) => void;
  }
>(({ children, className, prefix, renderLabel, onClick, attributes, ...props }, ref) => {
  const element = useElement<TMentionElement>();
  const selected = useSelected();
  const focused = useFocused();
  const mounted = useMounted();

  return (
    <PlateElement
      ref={ref}
      className={cn(
        "inline-block cursor-pointer align-baseline",
        selected && focused && "ring-2 ring-ring rounded-md",
        element?.children?.[0]?.bold === true && "font-bold",
        element?.children?.[0]?.italic === true && "italic",
        className,
      )}
      attributes={{
        onClick: getHandler(onClick, element),
        contentEditable: false,
        ...attributes,
      }}
      data-slate-value={element.value}
      {...props}
    >
      {mounted && (
        <React.Fragment>
          {IS_APPLE && children}
          <UserLazyUsername username={element.value} />
          {!IS_APPLE && children}
        </React.Fragment>
      )}
    </PlateElement>
  );
});
