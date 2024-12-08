import { Link, MoreHorizontal, Trash2 } from "lucide-react";
import { ActionButton, type DropdownItem } from "../post/post-action-button";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

export const DraftOptionsDropdown = ({ onDeleteClick }: { onDeleteClick: () => void }) => {
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
      onClick: onDeleteClick,
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

export const DraftDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent onClick={(e) => e.stopPropagation()}>
      <DialogHeader>
        <DialogTitle>Are you sure you want to delete this draft?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
