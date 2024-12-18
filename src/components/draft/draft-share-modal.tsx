"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface DraftShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DraftShareModal = ({ isOpen, onClose }: DraftShareModalProps) => {
  const [viewAccess, setViewAccess] = useState<"everyone" | "invited">("everyone");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!", { description: "The draft link has been copied to your clipboard." });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "There was an error copying the link.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share draft</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center place-content-between gap-3">
            <Select value={viewAccess} onValueChange={(value: "everyone" | "invited") => setViewAccess(value)}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select view access" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                <SelectItem value="everyone">Everyone with link</SelectItem>
                <SelectItem disabled value="invited">
                  Only invited users{" "}
                  <Badge className="ml-2" variant={"outline"}>
                    soon
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={copyLink} variant={"ghost"}>
              <LinkIcon size={18} />
              {"Copy link"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {viewAccess === "everyone"
              ? "Anyone with this link will be able to edit your draft."
              : "Only users you specifically invite will be able to edit this draft."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
