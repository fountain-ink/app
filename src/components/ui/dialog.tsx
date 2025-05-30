"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn, createPrimitiveElement, withCn, withRef } from "@udecode/cn";
import { X } from "lucide-react";

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = withCn(
  DialogPrimitive.Overlay,
  "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
);

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  overlay?: boolean;
};

export const DialogContent = withRef<typeof DialogPrimitive.Content, DialogContentProps>(
  ({ children, className, overlay = true, ...props }, ref) => (
    <DialogPortal>
      {overlay && <DialogOverlay />}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[51] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-5 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-5 top-5 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center">
            <X className="size-4" />
          </div>
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);

export const DialogHeader = withCn(createPrimitiveElement("div"), "flex flex-col space-y-1.5 text-center sm:text-left");

export const DialogFooter = withCn(
  createPrimitiveElement("div"),
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
);

export const DialogTitle = withCn(DialogPrimitive.Title, "text-lg font-semibold leading-none tracking-tight");

export const DialogDescription = withCn(DialogPrimitive.Description, "text-sm text-muted-foreground");
