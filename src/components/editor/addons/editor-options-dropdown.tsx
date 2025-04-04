"use client";

import { LinkIcon } from "@/components/icons/link";
import { AnimatedMenuItem } from "@/components/navigation/animated-item";
import { BrushIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { DraftShareModal } from "@/components/draft/draft-share-modal";
import { MenuIcon } from "@/components/icons/menu";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, useOpenState } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export const EditorOptionsDropdown = () => {
  const { open, onOpenChange } = useOpenState();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const onShare = () => {
    setIsShareModalOpen(true);
  };
  const searchParams = useSearchParams();
  const isPreview = searchParams.has("preview");

  const onPreview = () => {
    const currentUrl = window.location.pathname;
    const newUrl = isPreview ? currentUrl : `${currentUrl}?preview`;

    if (isPreview) {
      window.history.pushState({}, "", newUrl);
    } else {
      window.open(newUrl, "_blank");
    }

    onOpenChange(false);
  };
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
        <AnimatedMenuItem icon={isPreview ? EyeOffIcon : EyeIcon} onClick={onPreview}>
          {isPreview ? "Exit preview" : "Preview post"}
        </AnimatedMenuItem>
        {/* <Link href={"/settings/theme"} prefetch>
          <AnimatedMenuItem icon={BrushIcon} onClick={onEditTheme}>
            Edit theme
          </AnimatedMenuItem>
        </Link> */}
      </DropdownMenuContent>
      <DraftShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </DropdownMenu>
  );
};
