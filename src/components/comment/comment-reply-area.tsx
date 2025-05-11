"use client";

import { Button } from "@/components/ui/button";
import { TextareaAutosize } from "@/components/ui/textarea";
import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { Account, PostFeedInfo } from "@lens-protocol/client";
import { currentSession, fetchPost, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { textOnly } from "@lens-protocol/metadata";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { UserAvatar } from "../user/user-avatar";
import { UserUsername } from "../user/user-handle";
import { UserName } from "../user/user-name";
import { cn } from "@/lib/utils";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { ConnectWalletButton } from "../auth/auth-wallet-button";
import { UserMenu } from "../user/user-menu";

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
  isCompact = false,
}: PostReplyAreaProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { isConnected: isWalletConnected, status: walletClientStatus } = useAccount();
  const { data: authenticatedUser, loading: isAuthenticatedUserLoading } = useAuthenticatedUser();

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

      if (!authenticatedUser && !isAuthenticatedUserLoading) {
        toast.error("Please log in to comment");
        return;
      }

      const rootPost = await fetchPost(lens, {
        post: postId,
      }).unwrapOr(null);

      if (!rootPost) {
        toast.error("Failed to fetch post");
        return;
      }

      const feed = "feed" in rootPost ? (rootPost.feed as PostFeedInfo) : undefined;

      const metadata = textOnly({
        content: content.trim(),
      });

      const { uri } = await storageClient.uploadAsJson(metadata);

      const result = await post(lens, {
        contentUri: uri,
        commentOn: {
          post: postId,
        },
        feed: feed?.address,
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(lens.waitForTransaction);

      if (result.isErr()) {
        toast.dismiss(pendingToast);
        toast.error("Failed to publish comment", {
          description: result.error instanceof Error ? result.error.message : "An unknown error occurred",
        });
        console.error("Error publishing comment:", result.error);
        return;
      }

      toast.dismiss(pendingToast);

      setContent("");

      if (onSubmit) {
        await onSubmit(content.trim());
      }
    } catch (error) {
      console.error("Error publishing comment:", error);
      toast.error("Error publishing comment", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel?.();
  };

  if (!isAuthenticatedUserLoading && !authenticatedUser) {
    return (
      <div className="flex items-center justify-between p-4 border border-border drop-shadow-lg rounded-sm bg-background">
        <p className="text-sm text-muted-foreground">Please login to comment</p>
        <UserMenu session={null} showDropdown={false} />
      </div>
    );
  }

  return (
    <div
      className={cn("p-4 border border-border drop-shadow-lg rounded-sm bg-background", {
        "mb-0": isCompact,
      })}
    >
      <div className="flex flex-col gap-4">

        {!isCompact && !isAuthenticatedUserLoading && authenticatedUser && (
          <div className="flex items-start gap-3">
            <UserAvatar account={account} className="w-10 h-10" />
            <div className="flex flex-col">
              <UserName profile={account} className="text-sm font-medium" />
              <UserUsername account={account} className="text-sm text-muted-foreground" />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <TextareaAutosize
            placeholder="Add your comment here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled || isSubmitting}
            rows={1}
            className="resize-none flex-grow min-h-8 border-none shadow-none p-0"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="flex justify-end items-center">
          {/* <Button variant="ghost" size="icon" disabled>
            <ImageIcon className="h-5 w-5" />
          </Button> */}
          <div className="space-x-2">
            <Button variant="ghost" onClick={handleCancel} disabled={disabled || isSubmitting}>
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={!content.trim() || disabled || isSubmitting}>
              {isSubmitting ? "Posting..." : "Reply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
