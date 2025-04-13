"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import type { Database } from "@/lib/supabase/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FeedbackItem = Database["public"]["Tables"]["feedback"]["Row"];

interface FeedbackDetailModalProps {
  feedback: FeedbackItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (id: number) => Promise<void>;
  onUpdateStatus: (id: number, status: string) => Promise<boolean>;
}

export function FeedbackDetailModal({
  feedback,
  open,
  onOpenChange,
  onResolve,
  onUpdateStatus,
}: FeedbackDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resolvedAt, setResolvedAt] = useState<string | null>(null);

  if (!feedback) return null;

  if (status === null && feedback.status) {
    setStatus(feedback.status);
  }

  if (resolvedAt === null && feedback.resolvedAt) {
    setResolvedAt(feedback.resolvedAt);
  }

  const currentStatus = status || feedback.status || "new";
  const currentResolvedAt = resolvedAt || feedback.resolvedAt;

  const handleStatusChange = async (newStatus: string) => {
    if (!feedback) return;

    setIsUpdating(true);
    let success = false;

    if (newStatus === "completed") {
      await onResolve(feedback.id);
      const now = new Date().toISOString();
      setResolvedAt(now);
      success = true;
    } else {
      success = await onUpdateStatus(feedback.id, newStatus);
    }

    if (success) {
      setStatus(newStatus);
    }

    setIsUpdating(false);
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const typeVariant = {
    "bug": "bg-red-50 text-red-700 border-border",
    "feature": "bg-purple-50 text-purple-700 border-border",
    "other": "bg-blue-50 text-blue-700 border-border",
  }[feedback.type] || "bg-gray-50 text-gray-700 border-border";

  const authorAddress = feedback.author || "Unknown";

  const displayAddress = authorAddress && authorAddress.length > 2
    ? authorAddress.substring(2)
    : authorAddress;

  const initials = authorAddress && authorAddress.length >= 4
    ? authorAddress.substring(2, 4).toUpperCase()
    : "??";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="h-8 flex items-center">Feedback #{feedback.id}</DialogTitle>
              <div className="flex gap-2 ml-2">
                <Badge variant="outline" className={typeVariant}>
                  {feedback.type?.charAt(0).toUpperCase() + feedback.type?.slice(1) || "Unknown"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="flex justify-between pt-2 items-center">
            <span>Submitted {feedback.createdAt && format(new Date(feedback.createdAt), "PPP 'at' p")}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue>
                    {formatStatus(currentStatus)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-10rem)]">
          <div className="space-y-6 p-1">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <div className="font-mono text-sm">{displayAddress}</div>
              </div>
            </div>

            {currentStatus === "completed" && currentResolvedAt && (
              <div className="rounded-lg bg-green-50 p-4 text-green-800 text-sm border border-border">
                <p>
                  Resolved {formatDistanceToNow(new Date(currentResolvedAt), { addSuffix: true })}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 whitespace-pre-wrap">
                {feedback.text}
              </div>

              {feedback.screenshot && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Screenshot</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <ScrollArea className="h-[400px]">
                      <div className="w-full">
                        <img
                          src={feedback.screenshot}
                          alt="Feedback screenshot"
                          className="w-full object-contain"
                        />
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <div className="" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 