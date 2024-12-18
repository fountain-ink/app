"use client";

import { MenuIcon } from "../icons/menu";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, useOpenState } from "./dropdown-menu";

interface BurgerDropdownMenuProps {
  children: React.ReactNode;
}

export const BurgerDropdownMenu = ({ children }: BurgerDropdownMenuProps) => {
  const { open, onOpenChange } = useOpenState();

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="outline-none">
          <MenuIcon animate={open} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" portal align="end">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
