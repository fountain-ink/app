"use client";

import { Button } from "@/components/ui/button";
import { Textarea, TextareaAutosize } from "@/components/ui/textarea";
import { useState } from "react";

interface PostReplyAreaProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const PostReplyArea = ({ onSubmit, disabled }: PostReplyAreaProps) => {
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

  return (
    <div className="space-y-4 mb-6">
      <TextareaAutosize
        placeholder="Add your comment here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled || isSubmitting}
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!content.trim() || disabled || isSubmitting}>
          {isSubmitting ? "Posting..." : "Reply"}
        </Button>
      </div>
    </div>
  );
};
