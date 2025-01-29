"use client";

import { Button } from "@/components/ui/button";
import { TextareaAutosize } from "@/components/ui/textarea";
import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { Account } from "@lens-protocol/client";
import { currentSession, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { textOnly } from "@lens-protocol/metadata";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { UserAvatar } from "../user/user-avatar";
import { cn } from "@/lib/utils";


interface PostReplyAreaProps {
  postId: string;
  onSubmit?: (content: string) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  account?: Account;
  isCompact?: boolean;
}

export const CommentReplyArea = ({
  postId,
  onSubmit,
  onCancel,
  disabled,
  account,
  isCompact = false
}: PostReplyAreaProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: walletClient } = useWalletClient();

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const pendingToast = toast.loading("Publishing comment...");

    try {
      const lens = await getLensClient();
      if (!lens.isSessionClient()) {
        toast.error("Please log in to comment");
        return;
      }

      const session = await currentSession(lens).unwrapOr(null);
      if (!session) {
        toast.error("Please log in to comment");
        return;
      }

      // Create metadata for the comment
      const metadata = textOnly({
        content: content.trim(),
      });

      // Upload metadata to IPFS
      const { uri } = await storageClient.uploadAsJson(metadata);

      // Create the comment post
      const result = await post(lens, {
        contentUri: uri,
        commentOn: {
          post: postId
        },
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(lens.waitForTransaction);

      if (result.isErr()) {
        toast.dismiss(pendingToast);
        toast.error("Failed to publish comment");
        console.error("Error publishing comment:", result.error);
        return;
      }

      toast.dismiss(pendingToast);
      toast.success("Comment published successfully!");

      // Clear the input
      setContent("");

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(content.trim());
      }
    } catch (error) {
      console.error("Error publishing comment:", error);
      toast.error("An error occurred while publishing the comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel?.();
  };

  return (
    <div className={cn("flex gap-4 p-4 border border-border rounded-sm bg-background drop-shadow-md mb-6", {
      "mb-0": isCompact
    })}>
      <div className="flex-1">
        <div className="space-y-4">
          <div className="flex gap-4">
            {!isCompact && <UserAvatar account={account} className="w-10 h-10 flex-shrink-0" />}
            <TextareaAutosize
              placeholder="Add your comment here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={disabled || isSubmitting}
              rows={3}
              className="resize-none flex-grow border-none shadow-none p-0 pt-2"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" size="icon" disabled>
              <ImageIcon className="h-5 w-5" />
            </Button>
            <div className="space-x-2">
              {!isCompact && (
                <Button variant="ghost" onClick={handleCancel} disabled={disabled || isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={!content.trim() || disabled || isSubmitting}>
                {isSubmitting ? "Posting..." : "Reply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
