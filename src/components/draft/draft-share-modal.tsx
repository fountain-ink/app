"use client";

"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkIcon, Share2Icon, UsersRoundIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

interface DraftShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  isCurrentlyCollaborative: boolean;
  currentUrl: string;
}

export const DraftShareModal = ({
  isOpen,
  onClose,
  documentId,
  isCurrentlyCollaborative,
  currentUrl: initialUrl // Renamed for clarity within component
}: DraftShareModalProps) => {
  const [viewAccess, setViewAccess] = useState<"everyone" | "invited">("everyone");
  const [isEnablingCollaboration, setIsEnablingCollaboration] = useState(false);
  const router = useRouter();

  const copyLink = async () => {
    try {
      const urlToCopy = new URL(initialUrl);
      if (isCurrentlyCollaborative || urlToCopy.searchParams.has("collab")) {
         if (!urlToCopy.searchParams.has("collab")) { // If already collab but param missing
            urlToCopy.searchParams.set("collab", "true");
         }
      }
      // For non-collaborative, copy the original URL without adding ?collab=true
      await navigator.clipboard.writeText(urlToCopy.toString());
      toast.success("Link copied!", { description: "The draft link has been copied to your clipboard." });
    } catch (_error) {
      toast.error("Failed to copy", {
        description: "There was an error copying the link.",
      });
    }
  };

  const handleEnableCollaboration = async () => {
    setIsEnablingCollaboration(true);
    try {
      const response = await fetch(`/api/drafts/${documentId}/enable-collaboration`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enable collaboration");
      }

      toast.success("Collaboration enabled!", {
        description: "This draft is now collaborative. The page will reload."
      });

      const newUrl = new URL(initialUrl);
      if (!newUrl.searchParams.has("collab")) {
        newUrl.searchParams.set("collab", "true");
        router.replace(newUrl.toString(), { scroll: false });
        setTimeout(() => window.location.reload(), 100);
      } else {
        window.location.reload(); // Already has ?collab=true or was already collaborative
      }

    } catch (error) {
      console.error("Error enabling collaboration:", error);
      toast.error("Error enabling collaboration", {
        description: error instanceof Error ? error.message : "An unknown error occurred."
      });
    } finally {
      setIsEnablingCollaboration(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2Icon className="mr-2 h-5 w-5" /> Share draft
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!isCurrentlyCollaborative && (
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center mb-2">
                <UsersRoundIcon className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-md font-semibold">Enable Real-time Collaboration</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Allow multiple people to edit this draft simultaneously.
                A unique collaborative session will be created.
              </p>
              <Button
                onClick={handleEnableCollaboration}
                disabled={isEnablingCollaboration}
                className="w-full"
              >
                {isEnablingCollaboration ? "Enabling..." : "Enable Collaboration"}
              </Button>
            </div>
          )}

          <div className="flex items-center place-content-between gap-3 mt-4">
            <Select
              value={viewAccess}
              onValueChange={(value: "everyone" | "invited") => setViewAccess(value)}
              disabled={!isCurrentlyCollaborative}
            >
              <SelectTrigger className="w-[220px] sm:w-[280px]">
                <SelectValue placeholder="Select view access" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                <SelectItem value="everyone">Everyone with link (can edit)</SelectItem>
                <SelectItem disabled value="invited">
                  Only invited users{" "}
                  <Badge className="ml-2" variant={"outline"}>
                    soon
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={copyLink} variant={"ghost"} className="flex-shrink-0">
              <LinkIcon size={18} className="mr-1 sm:mr-2" />
              Copy link
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            {isCurrentlyCollaborative
              ? (viewAccess === "everyone"
                ? "Anyone with the link can join and edit this collaborative draft."
                : "Only users you specifically invite will be able to edit this draft.")
              : "Enable collaboration to allow others to edit and to set access permissions."}
          </p>
        </div>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
