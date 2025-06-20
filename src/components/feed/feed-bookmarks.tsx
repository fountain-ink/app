"use client";

import type { AnyPost } from "@lens-protocol/client";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useFeedContext } from "@/contexts/feed-context";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Feed, isValidArticlePost, renderArticlePost } from "./feed";

interface BookmarksFeedProps {
  forceViewMode?: "single" | "grid";
}

export function BookmarksFeed({ forceViewMode }: BookmarksFeedProps = {}) {
  const { viewMode: contextViewMode } = useFeedContext();
  const viewMode = forceViewMode || contextViewMode;
  const { bookmarks, loading, hasMore, fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const renderBookmark = useCallback(
    (post: AnyPost, index: number) => {
      return renderArticlePost(
        post,
        viewMode,
        {
          showAuthor: false,
        },
        index,
      );
    },
    [viewMode],
  );

  // Filter out invalid posts - bookmarks should have contentJson - memoize to prevent unnecessary re-renders
  const validBookmarks = useMemo(() => bookmarks.filter(isValidArticlePost), [bookmarks]);

  return (
    <>
      <Feed
        items={validBookmarks}
        renderItem={renderBookmark}
        isLoading={loading}
        hasMore={false}
        emptyTitle="No bookmarks yet"
        emptySubtitle="Start exploring and save your favorite posts"
        skeletonCount={3}
        forceViewMode={forceViewMode}
      />

      {hasMore && bookmarks.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => fetchBookmarks(bookmarks[bookmarks.length - 1]?.id)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
}
