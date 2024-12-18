"use client";

import { LinkIcon } from "@/components/icons/link";
import { AnimatedMenuItem } from "@/components/navigation/animated-item";
import { BrushIcon, EyeIcon } from "lucide-react";

import { DraftShareModal } from "@/components/draft/draft-share-modal";
import { MenuIcon } from "@/components/icons/menu";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, useOpenState } from "@/components/ui/dropdown-menu";
import { useState } from "react";

export const EditorOptionsDropdown = () => {
  const { open, onOpenChange } = useOpenState();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const onShare = () => {
    console.log(isShareModalOpen);
    setIsShareModalOpen(true);
  };
  const onPreview = () => {};
  const onEditTheme = () => {};
  
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="outline-none">
          <MenuIcon animate={open} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" portal align="end">
        <AnimatedMenuItem icon={LinkIcon} onClick={onShare}>
          Share draft
        </AnimatedMenuItem>
        <AnimatedMenuItem icon={EyeIcon} onClick={onPreview}>
          Preview post
        </AnimatedMenuItem>
        <AnimatedMenuItem icon={BrushIcon} onClick={onEditTheme}>
          Edit theme
        </AnimatedMenuItem>
      </DropdownMenuContent>
      <DraftShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </DropdownMenu>
  );
};
