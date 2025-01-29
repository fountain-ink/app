import { AnyPost } from "@lens-protocol/client";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { PostReactions } from "./post-reactions";
import { useState } from "react";
import { PostReplyArea } from "./post-reply-area";
import { UserAvatar } from "../user/user-avatar";
import { UserName } from "../user/user-name";
import { UserUsername } from "../user/user-handle";
import { formatRelativeTime } from "@/lib/utils";

interface CommentViewProps {
  comment: AnyPost;
}

export const CommentView = ({ comment }: CommentViewProps) => {
  const [showReplyArea, setShowReplyArea] = useState(false);

  if (comment.__typename !== "Post") return null;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <UserAvatar account={comment.author} className="w-10 h-10" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <UserName profile={comment.author} className="text-sm font-medium" />
              <UserUsername account={comment.author} className="text-sm text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.timestamp)}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm">
        {"content" in comment.metadata && comment.metadata.content}
      </div>

      <div className="flex items-center gap-4">
        <PostReactions post={comment} />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowReplyArea(!showReplyArea)}
        >
          Reply
        </Button>
      </div>

      {showReplyArea && (
        <div className="pl-11">
          <PostReplyArea 
            postId={comment.id} 
            onSubmit={async () => {
              setShowReplyArea(false);
            }}
            onCancel={() => setShowReplyArea(false)}
          />
        </div>
      )}
    </div>
  );
}; 
