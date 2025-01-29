"use client";

import { Button } from "@/components/ui/button";
import { TextareaAutosize } from "@/components/ui/textarea";
import { Account } from "@lens-protocol/client";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { UserAvatar } from "../user/user-avatar";

interface PostReplyAreaProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  account?: Account;
}

export const PostReplyArea = ({ onSubmit, onCancel, disabled, account }: PostReplyAreaProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <UserAvatar account={account} className="w-10 h-10 flex-shrink-0" />
        <TextareaAutosize
          placeholder="Add your comment here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled || isSubmitting}
          rows={3}
          className="resize-none flex-grow border-none p-0 pt-2"
        />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" size="icon" disabled>
          <ImageIcon className="h-5 w-5" />
        </Button>
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
  );
};
