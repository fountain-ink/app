"use client"

import { motion } from "framer-motion"
import { useRef, useCallback, ReactNode, useEffect } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { PostSkeleton } from "@/components/post/post-skeleton"
import { GraphicHand2 } from "@/components/icons/custom-icons"
import { cn } from "@/lib/utils"
import { useFeedContext } from "@/contexts/feed-context"

export interface FeedProps {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  emptyTitle?: string
  emptySubtitle?: string
  className?: string
  skeletonCount?: number
}

export function Feed({
  items,
  renderItem,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  emptyTitle = "No posts available",
  emptySubtitle = "Check back later or explore other content",
  className,
  skeletonCount = 3,
}: FeedProps) {
  const { viewMode } = useFeedContext()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  const entry = useIntersectionObserver(loadMoreRef, { threshold: 0.5 })

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading && onLoadMore) {
      onLoadMore()
    }
  }, [entry?.isIntersecting, hasMore, isLoading, onLoadMore])

  if (items.length === 0 && !isLoading) {
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

  return (
    <div className={cn("w-full", viewMode === "grid" ? className : "")}>
      <div
        className={cn(
          "w-full",
          viewMode === "single" && "flex flex-col gap-4 items-center"
        )}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={viewMode === "single" ? "w-full" : ""}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <div className={cn("mt-6", viewMode === "grid" && "grid grid-cols-1 md:grid-cols-2 gap-6")}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <PostSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="h-10" />}
    </div>
  )
}