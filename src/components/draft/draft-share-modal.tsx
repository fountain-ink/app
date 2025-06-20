"use client";

import { slateToDeterministicYjsState } from "@udecode/plate-yjs";
import { LinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as Y from "yjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "../ui/badge";

interface DraftShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  collaborative: boolean;
}

export const DraftShareModal = ({ isOpen, onClose, documentId, collaborative }: DraftShareModalProps) => {
  const [viewAccess, setViewAccess] = useState<"everyone" | "invited">("everyone");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!", { description: "The draft link has been copied to your clipboard." });
    } catch (_error) {
      toast.error("Failed to copy", {
        description: "There was an error copying the link.",
      });
    }
  };

  const generateYDoc = async (documentId: string, content: any) => {
    const yDoc = new Y.Doc();
    const initialDelta = await slateToDeterministicYjsState(documentId, content);
    yDoc.transact(() => {
      Y.applyUpdate(yDoc, initialDelta);
    });
    return yDoc;
  };

  const enableCollab = async () => {
    try {
      const draftRes = await fetch(`/api/drafts?id=${documentId}`);
      if (!draftRes.ok) {
        toast.error("Failed to fetch draft content");
        return;
      }

      const { draft } = await draftRes.json();
      const content = draft.contentJson;

      const yDoc = await generateYDoc(documentId, content);
      const yDocBinary = Y.encodeStateAsUpdate(yDoc);
      const base64String = btoa(String.fromCharCode(...yDocBinary));

      const res = await fetch(`/api/drafts?id=${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableCollaboration: true,
          yDocBase64: base64String,
        }),
      });

      if (res.ok) {
        toast.success("Collaboration enabled");
        window.location.reload();
      } else {
        toast.error("Failed to enable collaboration");
      }
    } catch (error) {
      console.error("Error enabling collaboration:", error);
      toast.error("Failed to enable collaboration");
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
            {collaborative ? (
              <Button onClick={copyLink} variant={"ghost"}>
                <LinkIcon size={18} />
                {"Copy link"}
              </Button>
            ) : (
              <Button onClick={enableCollab} variant={"ghost"}>
                Enable collaboration
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
