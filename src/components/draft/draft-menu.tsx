import { Link, MoreHorizontal, Trash2 } from "lucide-react";
import { ActionButton, type DropdownItem } from "../post/post-action-button";

export const DraftMenu = ({ onDeleteClick }: { onDeleteClick: () => void }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const dropdownItems: DropdownItem[] = [
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

