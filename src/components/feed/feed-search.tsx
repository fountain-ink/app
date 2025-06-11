"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client"
import { MainContentFocus } from "@lens-protocol/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import { getLensClient } from "@/lib/lens/client"
import { env } from "@/env"
import { Feed, renderArticlePost, isValidArticlePost } from "./feed"
import { useInfiniteFeed } from "@/hooks/use-infinite-feed"
import { useBanFilter, filterBannedPosts } from "@/hooks/use-ban-filter"
import { useFeedContext } from "@/contexts/feed-context"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { FeedViewToggle } from "./feed-view-toggle"

export interface SearchFeedProps {
  initialPosts: AnyPost[]
  initialPaginationInfo: Partial<PaginatedResultInfo>
  initialQuery: string
  preFilteredPosts?: boolean
}

export function SearchFeed({
  initialPosts,
  initialPaginationInfo,
  initialQuery,
  preFilteredPosts = false,
}: SearchFeedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { viewMode } = useFeedContext()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(searchQuery, 500)
  const [filteredInitialPosts, setFilteredInitialPosts] = useState<AnyPost[]>(
    preFilteredPosts ? initialPosts : []
  )
  const [isInitializing, setIsInitializing] = useState(!preFilteredPosts)
  const [isSearching, setIsSearching] = useState(false)
  const { checkBanStatus } = useBanFilter()

  useEffect(() => {
    if (!preFilteredPosts) {
      filterBannedPosts(initialPosts, checkBanStatus).then(filtered => {
        setFilteredInitialPosts(filtered)
        setIsInitializing(false)
      })
    }
  }, [initialPosts, checkBanStatus, preFilteredPosts])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedQuery) {
      params.set("q", debouncedQuery)
    } else {
      params.delete("q")
    }
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search"
    router.push(newUrl, { scroll: false })
  }, [debouncedQuery, router, searchParams])

  const fetchMore = useCallback(async (cursor?: string) => {
    if (!debouncedQuery) {
      return { items: [], pageInfo: undefined }
    }

    const lens = await getLensClient()
    
    const actualCursor = cursor === "initial" ? undefined : cursor
    
    const result = await fetchPosts(lens, {
      filter: {
        metadata: { mainContentFocus: [MainContentFocus.Article] },
        searchQuery: debouncedQuery,
        apps: [env.NEXT_PUBLIC_APP_ADDRESS],
      },
      cursor: actualCursor,
    }).unwrapOr(null)

    if (!result) {
      return { items: [], pageInfo: undefined }
    }

    const filtered = await filterBannedPosts(result.items, checkBanStatus)
    return { items: filtered, pageInfo: result.pageInfo }
  }, [debouncedQuery, checkBanStatus])

  const { items, isLoading, hasMore, loadMore, reset } = useInfiniteFeed({
    initialItems: filteredInitialPosts,
    initialPaginationInfo,
    fetchMore,
  })

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery === initialQuery) return
      
      setIsSearching(true)
      reset()
      
      if (debouncedQuery) {
        const result = await fetchMore()
        if (result.items.length > 0) {
          reset(result.items, result.pageInfo || {})
        }
      }
      
      setIsSearching(false)
    }

    performSearch()
  }, [debouncedQuery, fetchMore, initialQuery, reset])

  const renderPost = useCallback((post: AnyPost, index: number) => {
    return renderArticlePost(post, viewMode, { showAuthor: true }, index)
  }, [viewMode])

  const validPosts = useMemo(() => items.filter(isValidArticlePost), [items])

  const showResults = debouncedQuery && !isSearching
  const showEmpty = showResults && validPosts.length === 0 && !isLoading && !isInitializing
  const showPrompt = !debouncedQuery && !isSearching

  return (
    <div className="w-full space-y-6">
      <div className="top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <FeedViewToggle />
        </div>
      </div>

      {showPrompt && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Search for articles</h3>
          <p className="text-sm text-muted-foreground">
            Enter keywords to find articles on Fountain
          </p>
        </div>
      )}

      {showEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="mb-2 text-lg font-semibold">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try searching with different keywords
          </p>
        </div>
      )}

      {showResults && !showEmpty && (
        <Feed
          items={validPosts}
          renderItem={renderPost}
          isLoading={isLoading || isInitializing || isSearching}
          hasMore={hasMore}
          onLoadMore={loadMore}
          emptyTitle="No results found"
          emptySubtitle="Try searching with different keywords"
        />
      )}
    </div>
  )
}