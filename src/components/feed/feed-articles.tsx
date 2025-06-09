"use client"

import { useCallback } from "react"
import type { AnyPost } from "@lens-protocol/client"
import { Feed, renderArticlePost, isValidArticlePost, UserProfileEmptyState } from "./feed"
import { useFeedContext } from "@/contexts/feed-context"

export interface ArticleFeedProps {
  posts: AnyPost[]
  isUserProfile?: boolean
}

export function ArticleFeed({ posts, isUserProfile = false }: ArticleFeedProps) {
  const { viewMode } = useFeedContext()
  
  const renderPost = useCallback((post: AnyPost) => {
    return renderArticlePost(post, viewMode, { showAuthor: false })
  }, [viewMode])

  // Filter out invalid posts
  const validPosts = posts.filter(isValidArticlePost)

  // Custom empty state for user profiles
  if (validPosts.length === 0 && isUserProfile) {
    return <UserProfileEmptyState />
  }

  return (
    <Feed
      items={validPosts}
      renderItem={renderPost}
      isLoading={false}
      hasMore={false}
      emptyTitle={isUserProfile ? "Nothing here yet" : "No posts available"}
      emptySubtitle={isUserProfile ? "Start writing to share your thoughts" : "Check back later for new content"}
    />
  )
}