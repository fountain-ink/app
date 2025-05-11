import { useComments } from "@/hooks/use-comments";
import { cn, formatRelativeTime } from "@/lib/utils";
import { AnyPost, PostReferenceType, postId } from "@lens-protocol/client";
import { fetchPostReferences } from "@lens-protocol/client/actions";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/user-avatar";
import { UserUsername } from "../user/user-handle";
import { UserName } from "../user/user-name";
import { CommentReactions } from "./comment-reactions";
import { CommentReplyArea } from "./comment-reply-area";
import { UserLazyUsername } from "../user/user-lazy-username";

interface CommentViewProps {
  comment: AnyPost;
  nestingLevel?: number;
  maxNestingLevel?: number;
  onMaxNestingReached?: (comment: AnyPost) => void;
  autoShowReplies?: boolean;
}

export const CommentView = ({
  comment,
  nestingLevel = 1,
  maxNestingLevel = 4,
  onMaxNestingReached,
  autoShowReplies = false,
}: CommentViewProps) => {
  const [showReplyArea, setShowReplyArea] = useState(false);
  const [showReplies, setShowReplies] = useState(autoShowReplies);
  const [hasFetched, setHasFetched] = useState(false);
  const { comments: nestedComments, loading, hasMore, fetchComments, refresh, nextCursor } = useComments(comment.id);

  const isAtMaxNesting = nestingLevel >= maxNestingLevel;

  const handleShowReplies = () => {
    if (isAtMaxNesting && onMaxNestingReached) {
      onMaxNestingReached(comment);
      return;
    }

    setShowReplies(!showReplies);
  };

  // Handle both auto-show and manual show replies
  useEffect(() => {
    if ((showReplies || autoShowReplies) && !hasFetched) {
      fetchComments();
      setHasFetched(true);
    }
  }, [showReplies, autoShowReplies, hasFetched, fetchComments]);

  // Update showReplies when autoShowReplies changes
  useEffect(() => {
    if (autoShowReplies) {
      setShowReplies(true);
    }
  }, [autoShowReplies]);

  if (comment.__typename !== "Post") return null;

  return (
    <div className="flex flex-col">
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
        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button> */}
      </div>

      <div className="text-sm mt-2">{"content" in comment.metadata && comment.metadata.content}</div>

      <div className="flex items-center gap-4">
        <div className="-ml-2">
          <CommentReactions
            comment={comment}
            onShowReplies={handleShowReplies}
            hasReplies={comment.stats.comments > 0}
            isLoadingReplies={loading && !hasFetched}
          />
        </div>
        {!showReplyArea && (
          <Button
            variant="ghostText"
            className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
            onClick={() => {
              if (isAtMaxNesting && onMaxNestingReached) {
                onMaxNestingReached(comment);
              } else {
                setShowReplyArea(!showReplyArea);
              }
            }}
          >
            Reply
          </Button>
        )}
      </div>

      <div className="relative mt-2">
        <AnimatePresence mode="popLayout">
          {showReplyArea && !isAtMaxNesting && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative mb-4"
            >
              <div className="absolute left-[11px] top-0 w-px bg-border h-full" />
              <div className="pl-8">
                <CommentReplyArea
                  postId={comment.id}
                  isCompact={true}
                  onSubmit={async () => {
                    setShowReplyArea(false);
                    setShowReplies(true);
                    await refresh(0, true);
                  }}
                  onCancel={() => setShowReplyArea(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {showReplies && !isAtMaxNesting && (nestedComments.length > 0 || (loading && !hasFetched)) && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative"
            >
              <div
                className={cn("absolute left-[11px] w-px bg-border", showReplyArea ? "-top-4" : "top-0", "h-full")}
              />
              <div className="pl-8">
                {nestedComments.length === 0 && loading && !hasFetched ? (
                  <div className="text-sm text-muted-foreground">Loading replies...</div>
                ) : nestedComments.length === 0 ? null : (
                  <motion.div
                    layout
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    }}
                  >
                    {nestedComments.map(
                      (nestedComment) =>
                        nestedComment.__typename === "Post" && (
                          <motion.div
                            layout
                            key={nestedComment.id}
                            variants={{
                              hidden: { opacity: 0, y: -8, scale: 0.95 },
                              visible: { opacity: 1, y: 0, scale: 1 },
                            }}
                            transition={{
                              duration: 0.25,
                              ease: [0.32, 0.72, 0, 1],
                            }}
                          >
                            <CommentView
                              comment={nestedComment}
                              nestingLevel={nestingLevel + 1}
                              maxNestingLevel={maxNestingLevel}
                              onMaxNestingReached={onMaxNestingReached}
                            />
                          </motion.div>
                        ),
                    )}
                    {loading && hasMore && <div className="text-sm text-muted-foreground">Loading...</div>}
                    {!loading && hasMore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => fetchComments(nextCursor)}
                      >
                        Show more replies
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
