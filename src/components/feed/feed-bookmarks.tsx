"use client"

import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Feed, renderArticlePost, isValidArticlePost } from "./feed"
import { useBookmarks } from "@/hooks/use-bookmarks"
import type { AnyPost } from "@lens-protocol/client"
import { useFeedContext } from "@/contexts/feed-context"

export function BookmarksFeed() {
  const { viewMode } = useFeedContext()
  const { bookmarks, loading, hasMore, fetchBookmarks } = useBookmarks()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const renderBookmark = useCallback((post: AnyPost) => {
    return renderArticlePost(post, viewMode, { 
      showAuthor: false 
    })
  }, [viewMode])

  // Filter out invalid posts - bookmarks should have contentJson
  const validBookmarks = bookmarks.filter(isValidArticlePost)

  return (
    <>
      <Feed
        items={validBookmarks}
        renderItem={renderBookmark}
        isLoading={loading && bookmarks.length === 0}
        hasMore={false} // We'll handle load more with a button
        emptyTitle="No bookmarks yet"
        emptySubtitle="Start exploring and save your favorite posts"
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
  )
}