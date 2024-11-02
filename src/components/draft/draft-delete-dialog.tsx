import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

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
