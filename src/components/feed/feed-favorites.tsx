"use client";

import type { AnyPost } from "@lens-protocol/client";
import { useCallback, useMemo } from "react";
import { useFeedContext } from "@/contexts/feed-context";
import { Feed, isValidArticlePost, renderArticlePost } from "./feed";

export interface FavoritesFeedProps {
  posts: AnyPost[];
  showFadeOut?: boolean;
  forceViewMode?: "single" | "grid";
}

export function FavoritesFeed({ posts, showFadeOut = true, forceViewMode }: FavoritesFeedProps) {
  const { viewMode } = useFeedContext();
  const effectiveViewMode = forceViewMode || viewMode;

  const renderPost = useCallback(
    (post: AnyPost, index: number) => {
      return renderArticlePost(
        post,
        effectiveViewMode,
        {
          showAuthor: true,
          showBlog: true,
          isCompact: true,
        },
        index,
      );
    },
    [effectiveViewMode],
  );

  const validPosts = useMemo(() => posts.filter(isValidArticlePost), [posts]);

  return (
    <div className={showFadeOut ? "relative" : ""}>
      <Feed
        items={validPosts}
        renderItem={renderPost}
        isLoading={false}
        hasMore={false}
        onLoadMore={() => {}}
        emptyTitle="No favorites available yet"
        emptySubtitle="Check back later for featured content"
        disableInfiniteScroll
        forceViewMode={forceViewMode}
      />
      {showFadeOut && validPosts.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
    </div>
  );
}
