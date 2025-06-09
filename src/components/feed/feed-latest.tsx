"use client"

import { useCallback, useState, useEffect } from "react"
import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client"
import { MainContentFocus } from "@lens-protocol/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import { getLensClient } from "@/lib/lens/client"
import { env } from "@/env"
import { Feed, renderArticlePost, isValidArticlePost, UserProfileEmptyState } from "./feed"
import { useInfiniteFeed } from "@/hooks/use-infinite-feed"
import { useBanFilter, filterBannedPosts } from "@/hooks/use-ban-filter"
import { useFeedContext } from "@/contexts/feed-context"

export interface LatestFeedProps {
  initialPosts: AnyPost[]
  initialPaginationInfo: Partial<PaginatedResultInfo>
  isUserProfile?: boolean
  preFilteredPosts?: boolean
}

export function LatestFeed({
  initialPosts,
  initialPaginationInfo,
  isUserProfile = false,
  preFilteredPosts = false,
}: LatestFeedProps) {
  const { viewMode } = useFeedContext()
  const [filteredInitialPosts, setFilteredInitialPosts] = useState<AnyPost[]>(
    preFilteredPosts ? initialPosts : []
  )
  const [isInitializing, setIsInitializing] = useState(!preFilteredPosts)
  const { checkBanStatus } = useBanFilter()

  // Filter initial posts once component mounts (only if not pre-filtered)
  useEffect(() => {
    if (!preFilteredPosts) {
      filterBannedPosts(initialPosts, checkBanStatus).then(filtered => {
        setFilteredInitialPosts(filtered)
        setIsInitializing(false)
      })
    }
  }, [initialPosts, checkBanStatus, preFilteredPosts])

  const fetchMore = useCallback(async (cursor?: string) => {
    const lens = await getLensClient()
    
    const result = await fetchPosts(lens, {
      filter: {
        metadata: { mainContentFocus: [MainContentFocus.Article] },
        feeds: [{ globalFeed: true }],
        apps: [env.NEXT_PUBLIC_APP_ADDRESS],
      },
      cursor,
    }).unwrapOr(null)

    if (!result) {
      return { items: [], pageInfo: undefined }
    }

    const filtered = await filterBannedPosts(result.items, checkBanStatus)
    return { items: filtered, pageInfo: result.pageInfo }
  }, [checkBanStatus])

  const { items, isLoading, hasMore, loadMore } = useInfiniteFeed({
    initialItems: filteredInitialPosts,
    initialPaginationInfo,
    fetchMore,
  })

  const renderPost = useCallback((post: AnyPost) => {
    return renderArticlePost(post, viewMode, { showAuthor: true })
  }, [viewMode])

  // Filter out invalid posts
  const validPosts = items.filter(isValidArticlePost)

  // Custom empty state for user profiles
  if (validPosts.length === 0 && !isLoading && !isInitializing && isUserProfile) {
    return <UserProfileEmptyState />
  }

  return (
    <Feed
      items={validPosts}
      renderItem={renderPost}
      isLoading={isLoading || isInitializing}
      hasMore={hasMore}
      onLoadMore={loadMore}
      emptyTitle={isUserProfile ? "Nothing here yet" : "No posts available"}
      emptySubtitle={isUserProfile ? "Start writing to share your thoughts" : "Check back later for new content"}
    />
  )
}