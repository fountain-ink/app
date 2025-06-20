"use client";

import type { AnyPost } from "@lens-protocol/client";
import { useCallback, useMemo } from "react";
import { useFeedContext } from "@/contexts/feed-context";
import { Feed, isValidArticlePost, renderArticlePost, UserProfileEmptyState } from "./feed";

export interface ArticleFeedProps {
  posts: AnyPost[];
  isUserProfile?: boolean;
  forceViewMode?: "single" | "grid";
}

export function ArticleFeed({ posts, isUserProfile = false, forceViewMode }: ArticleFeedProps) {
  const { viewMode: contextViewMode } = useFeedContext();
  const viewMode = forceViewMode || contextViewMode;

  const renderPost = useCallback(
    (post: AnyPost, index: number) => {
      return renderArticlePost(post, viewMode, { showAuthor: false }, index);
    },
    [viewMode],
  );

  // Filter out invalid posts - memoize to prevent unnecessary re-renders
  const validPosts = useMemo(() => posts.filter(isValidArticlePost), [posts]);

  // Custom empty state for user profiles
  if (validPosts.length === 0 && isUserProfile) {
    return <UserProfileEmptyState />;
  }

  return (
    <Feed
      items={validPosts}
      renderItem={renderPost}
      isLoading={false}
      hasMore={false}
      emptyTitle={isUserProfile ? "Nothing here yet" : "No posts available"}
      emptySubtitle={isUserProfile ? "Start writing to share your thoughts" : "Check back later for new content"}
      forceViewMode={forceViewMode}
    />
  );
}
