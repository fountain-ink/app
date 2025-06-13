"use client"

import { useCallback, useMemo } from "react"
import type { AnyPost } from "@lens-protocol/client"
import { Feed, renderArticlePost, isValidArticlePost } from "./feed"
import { useFeedContext } from "@/contexts/feed-context"

export interface FavoritesFeedProps {
  posts: AnyPost[]
  showFadeOut?: boolean
}

export function FavoritesFeed({ posts, showFadeOut = true }: FavoritesFeedProps) {
  const { viewMode } = useFeedContext()

  const renderPost = useCallback((post: AnyPost, index: number) => {
    return renderArticlePost(post, viewMode, { 
      showAuthor: true,
      showBlog: true,
      isCompact: true
    }, index)
  }, [viewMode])

  const validPosts = useMemo(() => posts.filter(isValidArticlePost), [posts])

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
      />
      {showFadeOut && validPosts.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
    </div>
  )
}