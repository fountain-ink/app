"use client"

import { useEffect, useCallback } from "react"
import { PostView } from "@/components/post/post-view"
import { PostVerticalView } from "@/components/post/post-vertical-view"
import { Button } from "@/components/ui/button"
import { Feed } from "./feed"
import { useBookmarks } from "@/hooks/use-bookmarks"
import type { Post } from "@lens-protocol/client"
import { useFeedContext } from "@/contexts/feed-context"

export function BookmarksFeed() {
  const { viewMode } = useFeedContext()
  const { bookmarks, loading, hasMore, fetchBookmarks } = useBookmarks()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const renderBookmark = useCallback((post: Post) => {
    if (post.__typename !== "Post") return null
    if (post.metadata?.__typename !== "ArticleMetadata") return null
    
    const commonOptions = {
      showAuthor: false,
      showTitle: true,
      showSubtitle: true,
      showDate: true,
      showPreview: true,
      showContent: false,
    }
    
    if (viewMode === "grid") {
      return (
        <div className="break-inside-avoid mb-4">
          <PostVerticalView
            post={post}
            authors={[post.author.address]}
            options={commonOptions}
          />
        </div>
      )
    }
    
    return (
      <PostView
        post={post}
        authors={[post.author.address]}
        options={commonOptions}
      />
    )
  }, [viewMode])

  // Filter out invalid posts
  const validBookmarks = bookmarks.filter(post => 
    post.__typename === "Post" && 
    post.metadata?.__typename === "ArticleMetadata"
  )

  return (
    <>
      <Feed
        items={validBookmarks}
        renderItem={renderBookmark}
        isLoading={loading && bookmarks.length === 0}
        hasMore={false} // We'll handle load more with a button
        emptyTitle="No bookmarks yet"
        className={viewMode === "grid" ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6" : ""}
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