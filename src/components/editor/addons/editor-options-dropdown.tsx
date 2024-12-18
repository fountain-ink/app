"use client";

import { LinkIcon } from "@/components/icons/link";
import { AnimatedMenuItem } from "@/components/navigation/animated-item";
import { BurgerDropdownMenu } from "@/components/ui/burger-dropdown-menu";
import { BrushIcon, EyeIcon } from "lucide-react";

export const EditorOptionsDropdown = () => {
  const onShare = () => {};
  const onPreview = () => {};
  const onEditTheme = () => {};

  return (
    <BurgerDropdownMenu>
      <AnimatedMenuItem icon={LinkIcon} onClick={onShare}>
        Share draft
      </AnimatedMenuItem>
      <AnimatedMenuItem icon={EyeIcon} onClick={onPreview}>
        Preview post
      </AnimatedMenuItem>
      <AnimatedMenuItem icon={BrushIcon} onClick={onEditTheme}>
        Edit theme
      </AnimatedMenuItem>
    </BurgerDropdownMenu>
  );
};
