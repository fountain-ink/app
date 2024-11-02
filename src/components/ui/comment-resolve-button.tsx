"use client";

import React from "react";
import { cn } from "@udecode/cn";
import { CommentResolveButton as CommentResolveButtonPrimitive, useComment } from "@udecode/plate-comments/react";

import { buttonVariants } from "./button";
import { CheckIcon, RefreshCwIcon } from "lucide-react";

export function CommentResolveButton() {
  const comment = useComment()!;

  return (
    <CommentResolveButtonPrimitive
      className={cn(buttonVariants({ variant: "ghost" }), "h-6 p-1 text-muted-foreground")}
    >
      {comment.isResolved ? <RefreshCwIcon className="size-4" /> : <CheckIcon className="size-4" />}
    </CommentResolveButtonPrimitive>
  );
}
