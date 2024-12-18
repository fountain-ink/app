"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface DraftShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DraftShareModal = ({ isOpen, onClose }: DraftShareModalProps) => {
  const [isCopying, setIsCopying] = useState(false);

  const copyLink = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!", { description: "The draft link has been copied to your clipboard." });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "There was an error copying the link.",
      });
    } finally {
      setIsCopying(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share draft</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Anyone with this link will be able to view your draft post.</p>
          <Button onClick={copyLink} disabled={isCopying} className="w-full">
            {isCopying ? "Copying..." : "Copy link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
