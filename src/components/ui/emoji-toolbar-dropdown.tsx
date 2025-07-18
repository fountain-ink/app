"use client";

import * as Popover from "@radix-ui/react-popover";
import { type ReactNode } from "react";

type EmojiToolbarDropdownProps = {
  children: ReactNode;
  control: ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function EmojiToolbarDropdown({ children, control, isOpen, setIsOpen }: EmojiToolbarDropdownProps) {
  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{control}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="z-[100]">{children}</Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
