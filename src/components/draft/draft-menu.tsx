import { Check, Link, MoreHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, type DropdownItem } from "../post/post-action-button";
import type { Draft } from "./draft";

export const DraftMenu = ({
  draft,
  onDeleteClick,
  onSelect,
  isSelected,
  onEnterSelectionMode,
  isSelectionMode,
}: {
  draft: Draft;
  onDeleteClick: () => void;
  onSelect: () => void;
  isSelected?: boolean;
  onEnterSelectionMode?: () => void;
  isSelectionMode?: boolean;
}) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${draft.id}`);
    toast.success("Link copied to clipboard!");
  };

  const dropdownItems: DropdownItem[] = [
    {
      icon: isSelected ? X : Check,
      label: isSelected ? "Deselect" : "Select",
      onClick: isSelectionMode ? onSelect : onEnterSelectionMode ?? (() => {}),
    },
    {
      icon: Link,
      label: "Copy link",
      onClick: handleCopyLink,
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => {
        if (onDeleteClick) {
          onDeleteClick();
        }
      },
    },
  ];

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ActionButton
        icon={MoreHorizontal}
        label="More"
        strokeColor="hsl(var(--muted-foreground))"
        fillColor="hsl(var(--muted-foreground))"
        dropdownItems={dropdownItems}
        showChevron={false}
      />
    </div>
  );
};
