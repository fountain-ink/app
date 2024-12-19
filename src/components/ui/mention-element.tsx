"use client";

import { useMounted } from "@/hooks/use-mounted";
import { cn, withRef } from "@udecode/cn";
import { IS_APPLE, getHandler } from "@udecode/plate-common";
import { useElement } from "@udecode/plate-common/react";
import type { TMentionElement } from "@udecode/plate-mention";
import React from "react";
import { useFocused, useSelected } from "slate-react";
import { UserLazyHandle } from "../user/user-lazy-handle";
import { PlateElement } from "./plate-element";

export const MentionElement = withRef<
  typeof PlateElement,
  {
    prefix?: string;
    renderLabel?: (mentionable: TMentionElement) => string;
    onClick?: (mentionNode: any) => void;
  }
>(({ children, className, prefix, renderLabel, onClick, ...props }, ref) => {
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
      onClick={getHandler(onClick, element)}
      data-slate-value={element.value}
      contentEditable={false}
      {...props}
    >
      {mounted && (
        <React.Fragment>
          {IS_APPLE && children}
          <UserLazyHandle handle={element.value} />
          {!IS_APPLE && children}
        </React.Fragment>
      )}
    </PlateElement>
  );
});
