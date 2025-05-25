"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { createDraft } from "@/lib/plate/create-draft";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface DraftShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  isCollaborative?: boolean;
}

export const DraftShareModal = ({ isOpen, onClose, documentId, isCollaborative = false }: DraftShareModalProps) => {
  const [viewAccess, setViewAccess] = useState<"everyone" | "invited">("everyone");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isCollaborative) {
      setShareUrl(`${window.location.origin}/w/c/${documentId}`);
    } else {
      setShareUrl(null);
    }
  }, [isCollaborative, documentId]);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!", { description: "The draft link has been copied to your clipboard." });
    } catch (_error) {
      toast.error("Failed to copy", {
        description: "There was an error copying the link.",
      });
    }
  };

  const enableCollaboration = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/drafts?id=${documentId}`);
      const data = await res.json();
      const { documentId: newId } = await createDraft({
        initialContent: data.draft?.contentJson,
        collaborative: true,
      });
      const url = `${window.location.origin}/w/c/${newId}`;
      setShareUrl(url);
    } catch (error) {
      toast.error("Failed to enable collaboration");
    } finally {
      setIsGenerating(false);
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
            {isCollaborative || shareUrl ? (
              <Button onClick={copyLink} variant={"ghost"} disabled={!shareUrl}>
                <LinkIcon size={18} />
                {"Copy link"}
              </Button>
            ) : (
              <Button onClick={enableCollaboration} variant="default" disabled={isGenerating}>
                {isGenerating ? "Creating..." : "Enable collaboration"}
              </Button>
            )}
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
