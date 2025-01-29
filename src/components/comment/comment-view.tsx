import { formatRelativeTime } from "@/lib/utils";
import { AnyPost } from "@lens-protocol/client";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommentReplyArea } from "./comment-reply-area";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/user-avatar";
import { UserUsername } from "../user/user-handle";
import { UserName } from "../user/user-name";
import { CommentReactions } from "./comment-reactions";
import { getLensClient } from "@/lib/lens/client";
import { PostReferenceType, postId } from "@lens-protocol/client";
import { fetchPostReferences } from "@lens-protocol/client/actions";

interface CommentViewProps {
  comment: AnyPost;
}

export const CommentView = ({ comment }: CommentViewProps) => {
  const [showReplyArea, setShowReplyArea] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [nestedComments, setNestedComments] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextCursor = useRef<string | undefined>(undefined);

  const fetchNestedComments = async (cursor?: string) => {
    if (loading || (!cursor && !hasMore) || comment.__typename !== "Post") return;

    setLoading(true);
    try {
      const client = await getLensClient();
      const result = await fetchPostReferences(client, {
        referencedPost: postId(comment.id),
        referenceTypes: [PostReferenceType.CommentOn],
        ...(cursor ? { cursor } : {}),
      });

      if (result.isErr()) {
        console.error("Failed to fetch nested comments:", result.error);
        return;
      }

      const { items, pageInfo } = result.value;
      setNestedComments((prev) => (cursor ? [...prev, ...Array.from(items)] : Array.from(items)));
      nextCursor.current = pageInfo.next ?? undefined;
      setHasMore(!!pageInfo.next);
    } catch (error) {
      console.error("Error fetching nested comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showReplies && nestedComments.length === 0) {
      fetchNestedComments();
    }
  }, [showReplies]);

  if (comment.__typename !== "Post") return null;

  return (
    <div className="flex flex-col gap-2">
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

      <div className="text-sm ">{"content" in comment.metadata && comment.metadata.content}</div>

      <div className="flex items-center gap-4 -mt-2">
        <div className="-ml-2">
          <CommentReactions
            comment={comment}
            onShowReplies={() => {
              setShowReplies(!showReplies);
              if (!showReplies && nestedComments.length === 0) {
                fetchNestedComments();
              }
            }}
            hasReplies={comment.stats.comments > 0}
            isLoadingReplies={loading && nestedComments.length === 0}
          />
        </div>
        <Button 
          variant="ghost" 
          className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
          onClick={() => setShowReplyArea(!showReplyArea)}
        >
          {showReplyArea ? 'Cancel' : 'Reply'}
        </Button>
      </div>

      {showReplies && comment.stats.comments > 0 && (
        <div className="border-l-2 border-border ml-1 mt-1">
          <div className="pl-4">
            {nestedComments.length === 0 && loading ? (
              <div className="text-sm text-muted-foreground">Loading replies...</div>
            ) : nestedComments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No replies yet</div>
            ) : (
              <div className="space-y-4">
                {nestedComments.map((nestedComment) => (
                  nestedComment.__typename === "Post" && (
                    <CommentView key={nestedComment.id} comment={nestedComment} />
                  )
                ))}
                {loading && (
                  <div className="text-sm text-muted-foreground">Loading more replies...</div>
                )}
                {!loading && hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => fetchNestedComments(nextCursor.current)}
                  >
                    Show more replies
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {showReplyArea && (
        <div className="">
          <CommentReplyArea
            postId={comment.id}
            isCompact={true}
            onSubmit={async () => {
              setShowReplyArea(false);
              // Refresh nested comments when a new reply is added
              setNestedComments([]);
              nextCursor.current = undefined;
              setHasMore(true);
              await fetchNestedComments();
            }}
            onCancel={() => setShowReplyArea(false)}
          />
        </div>
      )}
    </div>
  );
};
