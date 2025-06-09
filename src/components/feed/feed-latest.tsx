"use client"

import { useCallback, useState, useEffect } from "react"
import type { AnyPost, PaginatedResultInfo, Post } from "@lens-protocol/client"
import { MainContentFocus } from "@lens-protocol/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import { getLensClient } from "@/lib/lens/client"
import { env } from "@/env"
import { PostView } from "@/components/post/post-view"
import { PostVerticalView } from "@/components/post/post-vertical-view"
import { DraftCreateButton } from "@/components/draft/draft-create-button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { GraphicHand2 } from "@/components/icons/custom-icons"
import { Feed } from "./feed"
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
    if (post.__typename !== "Post") return null
    if (post.metadata.__typename !== "ArticleMetadata") return null
    if (!post.metadata.attributes.some(attr => attr.key === "contentJson")) return null

    const commonOptions = {
      showContent: false,
      showAuthor: true,
      showTitle: true,
      showSubtitle: true,
      showBlog: true,
      showDate: true,
      showPreview: true,
    }

    if (viewMode === "grid") {
      return (
        <div className="break-inside-avoid mb-4">
          <PostVerticalView
            options={commonOptions}
            authors={[post.author.address]}
            post={post as Post}
          />
        </div>
      )
    }

    return (
      <PostView
        options={commonOptions}
        authors={[post.author.address]}
        post={post}
      />
    )
  }, [viewMode])

  // Filter out invalid posts
  const validPosts = items.filter(post => {
    if (post.__typename !== "Post") return false
    if (post.metadata.__typename !== "ArticleMetadata") return false
    return post.metadata.attributes.some(attr => attr.key === "contentJson")
  })

  // Custom empty state for user profiles
  if (validPosts.length === 0 && !isLoading && !isInitializing && isUserProfile) {
    return (
      <Card className="m-0 md:m-10 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
        <CardHeader>
          <GraphicHand2 />
        </CardHeader>
        <CardContent>
          <span className="font-[family-name:var(--title-font)] text-lg lg:text-xl text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            Nothing here yet, but the world awaits your words.
          </span>
        </CardContent>
        <CardFooter>
          <DraftCreateButton text="Start writing" />
        </CardFooter>
      </Card>
    )
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
      className={viewMode === "grid" ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6" : ""}
    />
  )
}