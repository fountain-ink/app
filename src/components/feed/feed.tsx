"use client"

import { motion } from "motion/react"
import { useRef, useCallback, ReactNode, useEffect, useMemo } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { PostSkeleton, PostVerticalSkeleton } from "@/components/post/post-skeleton"
import { GraphicHand2 } from "@/components/icons/custom-icons"
import { cn } from "@/lib/utils"
import { useFeedContext } from "@/contexts/feed-context"
import type { AnyPost, Post } from "@lens-protocol/client"
import { PostView } from "@/components/post/post-view"
import { PostVerticalView } from "@/components/post/post-vertical-view"
import { DraftCreateButton } from "@/components/draft/draft-create-button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Masonry } from "masonic"
import { useMediaQuery } from "@/hooks/use-media-query"

export const GRID_LAYOUT_CLASSES = "columns-1 sm:columns-2 lg:columns-3 gap-6"

export function isValidArticlePost(post: AnyPost): boolean {
  return (
    post.__typename === "Post" &&
    post.metadata.__typename === "ArticleMetadata" &&
    post.metadata.attributes.some(attr => attr.key === "contentJson")
  )
}

export function UserProfileEmptyState() {
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

export interface PostRenderOptions {
  showContent?: boolean
  showAuthor?: boolean
  showBlog?: boolean
  showTitle?: boolean
  showSubtitle?: boolean
  showDate?: boolean
  showPreview?: boolean
}

export function renderArticlePost(
  post: AnyPost, 
  viewMode: "single" | "grid", 
  options: PostRenderOptions = {},
  index?: number
): ReactNode {
  if (!isValidArticlePost(post)) return null
  
  const defaultOptions = {
    showContent: false,
    showBlog: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    ...options
  }

  if (viewMode === "grid") {
    return (
      <PostVerticalView
        options={defaultOptions}
        authors={[post.author.address]}
        post={post as Post}
        priority={index !== undefined && index < 6}
      />
    )
  }

  return (
    <PostView
      options={defaultOptions}
      authors={[post.author.address]}
      post={post as Post}
    />
  )
}

export interface FeedProps {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  emptyTitle?: string
  emptySubtitle?: string
  skeletonCount?: number
  forceViewMode?: "single" | "grid"
}

export function Feed({
  items,
  renderItem,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  emptyTitle = "No posts available",
  emptySubtitle = "Check back later or explore other content",
  skeletonCount = 6,
  forceViewMode,
}: FeedProps) {
  const { viewMode: contextViewMode } = useFeedContext()
  const viewMode = forceViewMode || contextViewMode
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  // Ensure items is always a valid array and memoize it to prevent unnecessary re-renders
  const safeItems = useMemo(() => {
    if (!Array.isArray(items)) return []
    return items.filter(item => item != null)
  }, [items])
  
  // Responsive column width for Masonic - max 3 columns
  const isLg = useMediaQuery("(min-width: 1024px)")
  const isMd = useMediaQuery("(min-width: 768px)")
  const isSm = useMediaQuery("(min-width: 640px)")
  
  const columnWidth = useMemo(() => {
    if (isLg) return 320  // 3 columns on large screens
    if (isMd) return 340  // 2 columns on medium
    if (isSm) return 360  // 2 columns on small
    return 480 // mobile full width
  }, [isLg, isMd, isSm])
  
  const masonryKey = useMemo(() => {
    return `masonry-${safeItems.length}-${isLoading}`
  }, [safeItems.length, isLoading])
  
  const masonryItems = useMemo(() => {
    if (isLoading && safeItems.length === 0) {
      return Array.from({ length: skeletonCount }, (_, i) => ({
        id: `skeleton-${i}`,
        _isSkeleton: true
      }))
    }
    
    const items = [...safeItems]
    
    if (isLoading && safeItems.length > 0) {
      const loadingSkeletons = Array.from({ length: Math.min(3, skeletonCount) }, (_, i) => ({
        id: `loading-skeleton-${i}`,
        _isSkeleton: true
      }))
      items.push(...loadingSkeletons)
    }
    
    return items
  }, [safeItems, isLoading, skeletonCount])

  const MasonryRenderItem = useCallback(({ data, index }: { data: any; index: number }) => {
    if (data._isSkeleton) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: Math.min(index * 0.05, 0.3) 
          }}
        >
          <PostVerticalSkeleton />
        </motion.div>
      )
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      >
        {renderItem(data, index)}
      </motion.div>
    )
  }, [renderItem])
  
  const entry = useIntersectionObserver(loadMoreRef, { 
    threshold: 0,
    rootMargin: '800px'
  })

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading && onLoadMore) {
      onLoadMore()
    }
  }, [entry?.isIntersecting, hasMore, isLoading, onLoadMore])

  if (safeItems.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="w-16 h-16 mb-4 text-muted-foreground/50">
          <GraphicHand2 />
        </div>
        <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{emptySubtitle}</p>
      </motion.div>
    )
  }

  if (viewMode === "grid") {
    return (
      <div className="w-full">
        <Masonry
          key={masonryKey}
          items={masonryItems}
          columnGutter={24}
          columnWidth={columnWidth}
          overscanBy={2}
          render={MasonryRenderItem}
          itemKey={(item) => item?.id || `item-${masonryItems.indexOf(item)}`}
        />

        {hasMore && <div ref={loadMoreRef} className="h-20" />}
      </div>
    )
  }

  // Single column view
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 items-center">
        {safeItems.map((item, index) => (
          <motion.div
            key={item?.id || `item-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="w-full"
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <div className="mt-6">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <PostSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="h-10" />}
    </div>
  )
}