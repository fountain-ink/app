"use client"

import { motion, useReducedMotion } from "motion/react"
import { useRef, useCallback, ReactNode, useEffect, useState, memo } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { PostSkeleton } from "@/components/post/post-skeleton"
import { GraphicHand2 } from "@/components/icons/custom-icons"
import { cn } from "@/lib/utils"
import { useFeedContext } from "@/contexts/feed-context"
import type { AnyPost, Post } from "@lens-protocol/client"
import { PostView } from "@/components/post/post-view"
import { DraftCreateButton } from "@/components/draft/draft-create-button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Masonry from "react-layout-masonry"

const MemoizedPostView = memo(PostView, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectionMode === nextProps.isSelectionMode &&
    prevProps.priority === nextProps.priority
  )
})

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
  isCompact?: boolean
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

  return (
    <MemoizedPostView
      options={defaultOptions}
      authors={[post.author.address]}
      post={post as Post}
      isVertical={viewMode === "grid"}
      priority={index !== undefined && index < 3}
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
  disableInfiniteScroll?: boolean
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
  disableInfiniteScroll = false,
}: FeedProps) {
  const { viewMode: contextViewMode } = useFeedContext()
  const viewMode = forceViewMode || contextViewMode
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [observerKey, setObserverKey] = useState(0)
  const safeItems = items && Array.isArray(items) ? items.filter(item => item != null) : []
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    setObserverKey(prev => prev + 1)
  }, [viewMode])

  const entry = useIntersectionObserver(loadMoreRef, {
    threshold: 0,
    rootMargin: '400px'
  })

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading && onLoadMore && !disableInfiniteScroll) {
      onLoadMore()
    }
  }, [entry?.isIntersecting, hasMore, isLoading, onLoadMore, disableInfiniteScroll])


  if (safeItems.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
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
      <div className="w-full px-4">
        <Masonry
          columns={{ 350: 1, 640: 2, 1024: 3 }}
          gap={32}
        >
          {isLoading && safeItems.length === 0 &&
            Array.from({ length: skeletonCount }, (_, i) => (
              <div
                key={`skeleton-${i}`}
                style={{ contain: 'layout style' }}
              >
                <PostSkeleton isVertical={true} className="w-full" />
              </div>
            ))
          }

          {safeItems.map((item, index) => (
            <div
              key={item?.id || `item-${index}`}
              style={{ contain: 'layout style' }}
              className={shouldReduceMotion ? '' : 'animate-fade-in'}
            >
              {renderItem(item, index)}
            </div>
          ))}

          {isLoading && safeItems.length > 0 &&
            Array.from({ length: Math.min(3, skeletonCount) }, (_, i) => (
              <div
                key={`loading-skeleton-${i}`}
                style={{ contain: 'layout style' }}
              >
                <PostSkeleton isVertical={true} className="w-full" />
              </div>
            ))
          }
        </Masonry>

        {hasMore && !disableInfiniteScroll && <div key={observerKey} ref={loadMoreRef} className="h-20" />}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 items-center">
        {safeItems.map((item, index) => (
          <div
            key={item?.id || `item-${index}`}
            className={cn(
              "w-full",
              shouldReduceMotion ? '' : 'animate-fade-in'
            )}
            style={{ contain: 'layout style' }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="mt-6">
          {Array.from({ length: Math.min(3, skeletonCount) }).map((_, i) => (
            <PostSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {hasMore && !disableInfiniteScroll && <div key={observerKey} ref={loadMoreRef} className="h-10" />}
    </div>
  )
}