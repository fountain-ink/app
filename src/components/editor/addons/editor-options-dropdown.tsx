"use client";

import { useAuthenticatedUser } from "@lens-protocol/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DraftShareModal } from "@/components/draft/draft-share-modal";
import { LinkIcon } from "@/components/icons/link";
import { MenuIcon } from "@/components/icons/menu";
import { AnimatedMenuItem } from "@/components/navigation/animated-item";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, useOpenState } from "@/components/ui/dropdown-menu";

export const EditorOptionsDropdown = ({
  documentId,
  collaborative,
}: {
  documentId: string;
  collaborative: boolean;
}) => {
  const { open, onOpenChange } = useOpenState();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { data: user } = useAuthenticatedUser();

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

  if (!user) {
    return null;
  }

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
      <DraftShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={documentId}
        collaborative={collaborative}
      />
    </DropdownMenu>
  );
};
