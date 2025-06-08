"use client"

import { useState } from "react"
import { LatestArticleFeed } from "./post-paginated-feed"
import { CuratedPaginatedFeed } from "./curated-paginated-feed"
import { Grid3x3, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client"

interface PostFeedWithToggleProps {
  feedType: "latest" | "curated"
  // Props for LatestArticleFeed
  initialPosts?: AnyPost[]
  initialPaginationInfo?: Partial<PaginatedResultInfo>
  isUserProfile?: boolean
  // Props for CuratedPaginatedFeed
  initialPostIds?: string[]
  hasMore?: boolean
  page?: number
}

export const PostFeedWithToggle = ({
  feedType,
  initialPosts = [],
  initialPaginationInfo,
  isUserProfile,
  initialPostIds = [],
  hasMore = false,
  page = 1,
}: PostFeedWithToggleProps) => {
  const [viewMode, setViewMode] = useState<"single" | "grid">("single")

  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4 px-4 sm:px-0">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode("single")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === "single"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Single column view"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Feed Component */}
      <div className={cn(
        "w-full",
        viewMode === "grid" 
          ? "max-w-7xl mx-auto px-4" 
          : "max-w-3xl mx-auto"
      )}>
        {feedType === "latest" ? (
          <LatestArticleFeed
            initialPosts={initialPosts}
            initialPaginationInfo={initialPaginationInfo || {}}
            isUserProfile={isUserProfile || false}
            viewMode={viewMode}
          />
        ) : (
          <CuratedPaginatedFeed
            initialPostIds={initialPostIds}
            initialPosts={initialPosts}
            hasMore={hasMore}
            page={page}
            viewMode={viewMode}
          />
        )}
      </div>
    </>
  )
}