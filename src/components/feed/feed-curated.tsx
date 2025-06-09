"use client"

import { useCallback, useState, useEffect } from "react"
import type { AnyPost, Post, PostId } from "@lens-protocol/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import { getLensClient } from "@/lib/lens/client"
import { PostView } from "@/components/post/post-view"
import { PostVerticalView } from "@/components/post/post-vertical-view"
import { Feed } from "./feed"
import { useInfiniteFeed } from "@/hooks/use-infinite-feed"
import { useFeedContext } from "@/contexts/feed-context"

export interface CuratedFeedProps {
  initialPostIds?: string[]
  initialPosts?: AnyPost[]
  hasMore?: boolean
  page?: number
  preFilteredPosts?: boolean
}

export function CuratedFeed({
  initialPostIds = [],
  initialPosts = [],
  hasMore = false,
  page = 1,
  preFilteredPosts = false,
}: CuratedFeedProps) {
  const { viewMode } = useFeedContext()
  const [loadedPostIds, setLoadedPostIds] = useState<Set<string>>(
    new Set(preFilteredPosts && initialPosts.length > 0 ? initialPosts.map(p => p.id) : [])
  )
  const [isInitializing, setIsInitializing] = useState(!preFilteredPosts || initialPosts.length === 0)

  const fetchPostsByIds = useCallback(async (postIds: string[]) => {
    if (!postIds.length) return []

    const lens = await getLensClient()
    const newPostIds = postIds.filter(id => !loadedPostIds.has(id))
    
    if (newPostIds.length === 0) return []

    const result = await fetchPosts(lens, { filter: { posts: newPostIds as PostId[] } })
    
    if (result.isOk()) {
      const posts = result.value.items
      setLoadedPostIds(prev => {
        const newIds = new Set(prev)
        posts.forEach(post => newIds.add(post.id))
        return newIds
      })
      return posts
    }
    
    console.error("Failed to fetch posts batch:", result.error)
    return []
  }, [loadedPostIds])

  const fetchMore = useCallback(async (_cursor?: string, currentPage?: number) => {
    const nextPage = (currentPage || page) + 1
    
    try {
      const response = await fetch(`/api/curate?page=${nextPage}&limit=10`)
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        const newPostIds = data.data.map((item: any) => item.slug)
        const posts = await fetchPostsByIds(newPostIds)
        return { 
          items: [...posts], // Convert readonly array to mutable
          pageInfo: { hasMore: data.hasMore } 
        }
      }
    } catch (error) {
      console.error("Failed to load more posts:", error)
    }
    
    return { items: [], pageInfo: { hasMore: false } }
  }, [page, fetchPostsByIds])

  // Initialize with posts or fetch by IDs
  useEffect(() => {
    const initialize = async () => {
      // If posts are pre-filtered/fetched, we're already initialized
      if (preFilteredPosts && initialPosts.length > 0) {
        return
      }
      
      if (initialPosts.length > 0) {
        setLoadedPostIds(new Set(initialPosts.map(post => post.id)))
        setIsInitializing(false)
      } else if (initialPostIds.length > 0) {
        const posts = await fetchPostsByIds(initialPostIds)
        // Update initial posts in the feed hook
        setIsInitializing(false)
      } else {
        setIsInitializing(false)
      }
    }
    
    initialize()
  }, [initialPosts, initialPostIds, fetchPostsByIds, preFilteredPosts])

  const { items, isLoading, hasMore: hasMoreItems, loadMore } = useInfiniteFeed({
    initialItems: initialPosts,
    initialPaginationInfo: { hasMore },
    fetchMore,
    pageSize: 10,
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

  return (
    <Feed
      items={validPosts}
      renderItem={renderPost}
      isLoading={isLoading || isInitializing}
      hasMore={hasMoreItems}
      onLoadMore={loadMore}
      emptyTitle="No curated posts available yet"
      emptySubtitle="Check back later for featured content"
      className={viewMode === "grid" ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6" : ""}
    />
  )
}