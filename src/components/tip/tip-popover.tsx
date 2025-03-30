"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface TipPopoverProps {
  children: React.ReactNode;
  onCollectClick: () => void;
  // Add onTipSelect later for tip button functionality
}

export const TipPopover = ({ children, onCollectClick }: TipPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" sideOffset={10} className="max-w-md bg-background p-4">
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="default"
            className="w-full flex items-center gap-2"
            onClick={() => {
              onCollectClick();
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            Collect Post
          </Button>

          <div className="flex items-center w-full gap-2">
            <div className="h-px flex-1 bg-border"></div>
            <p className="text-sm text-muted-foreground">Or tip the author</p>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <div className="flex gap-2 place-items-center justify-center w-full">
            {/* TODO: Implement tip functionality */}
            <Button variant="default" >$2</Button>
            <Button variant="outline" >$5</Button>
            <Button variant="outline" >$10</Button>
            <Button variant="outline" >Other</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 