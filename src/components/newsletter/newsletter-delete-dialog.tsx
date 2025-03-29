import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Trash2Icon } from "lucide-react";

interface NewsletterDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogAddress: string;
  onSuccess?: () => void;
}

export function NewsletterDeleteDialog({ open, onOpenChange, blogAddress, onSuccess }: NewsletterDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/newsletter/${blogAddress}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete newsletter");
      }

      toast.success("Newsletter deleted successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete newsletter");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Newsletter</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this newsletter? This will <b>permanently</b> delete all subscriber data.
            This action <b>cannot be undone</b>.
            <br />
            <br />
            <span className="text-muted-foreground">Hold the delete button to confirm.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <ConfirmButton
            variant="destructive"
            onConfirm={handleDelete}
            disabled={isDeleting}
            duration={3000}
            icon={Trash2Icon}
            className="gap-2"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </ConfirmButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
