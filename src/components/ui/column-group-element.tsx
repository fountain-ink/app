import { cn, withRef } from "@udecode/cn";
import { useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import { ColumnItemPlugin, useColumnState, useDebouncePopoverOpen } from "@udecode/plate-layout/react";
import React from "react";
import { useReadOnly } from "slate-react";

import { Button } from "./button";
import { PlateElement } from "./plate-element";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Separator } from "./separator";

import type { TColumnElement } from "@udecode/plate-layout";
import { BedDoubleIcon, Columns2Icon, Columns3Icon, Columns4Icon, DeleteIcon } from "lucide-react";

export const ColumnGroupElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  return (
    <PlateElement ref={ref} className={cn(className, "my-2")} {...props}>
      <ColumnFloatingToolbar>
        <div className={cn("flex size-full gap-4 rounded")}>{children}</div>
      </ColumnFloatingToolbar>
    </PlateElement>
  );
});

export function ColumnFloatingToolbar({ children }: React.PropsWithChildren) {
  const readOnly = useReadOnly();

  const {
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  } = useColumnState();

  const element = useElement<TColumnElement>(ColumnItemPlugin.key);

  const { props: buttonProps } = useRemoveNodeButton({ element });

  const isOpen = useDebouncePopoverOpen();

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>
      <PopoverContent
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="center"
        side="top"
        sideOffset={10}
      >
        <div className="box-content flex h-9 items-center gap-1 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          <Button size="sms" variant="ghost" onClick={setDoubleColumn}>
            <Columns2Icon />
          </Button>
          <Button size="sms" variant="ghost" onClick={setThreeColumn}>
            <Columns3Icon />
          </Button>
          <Button size="sms" variant="ghost" onClick={setRightSideDoubleColumn}>
            <Columns3Icon />
          </Button>
          <Button size="sms" variant="ghost" onClick={setLeftSideDoubleColumn}>
            <Columns4Icon />
          </Button>
          <Button size="sms" variant="ghost" onClick={setDoubleSideDoubleColumn}>
            <BedDoubleIcon />
          </Button>

          <Separator orientation="vertical" className="my-1" />
          <Button size="sms" variant="ghost" {...buttonProps}>
            <DeleteIcon />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
