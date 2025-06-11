import { useState, useCallback, useEffect } from "react"
import { PaginatedResultInfo } from "@lens-protocol/client"

export interface UseInfiniteFeedOptions<T> {
  initialItems: T[]
  initialPaginationInfo?: Partial<PaginatedResultInfo> | { hasMore?: boolean; totalCount?: number }
  fetchMore: (cursor?: string, page?: number) => Promise<{
    items: T[]
    pageInfo?: Partial<PaginatedResultInfo> | { hasMore?: boolean; totalCount?: number }
  }>
  pageSize?: number
}

export interface UseInfiniteFeedResult<T> {
  items: T[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

export function useInfiniteFeed<T extends { id: string }>({
  initialItems,
  initialPaginationInfo,
  fetchMore,
  pageSize = 10,
}: UseInfiniteFeedOptions<T>): UseInfiniteFeedResult<T> {
  const [items, setItems] = useState<T[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [paginationInfo, setPaginationInfo] = useState(initialPaginationInfo)
  const [page, setPage] = useState(1)

  // Determine if we have more items to load
  const hasMore = paginationInfo
    ? 'next' in paginationInfo
      ? !!paginationInfo.next
      : 'hasMore' in paginationInfo ? !!paginationInfo.hasMore : false
    : false

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return
    }

    setIsLoading(true)
    try {
      const cursor = paginationInfo && 'next' in paginationInfo && paginationInfo.next ? paginationInfo.next : undefined
      const result = await fetchMore(cursor, page)

      if (result.items.length > 0) {
        setItems(prev => {
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = result.items.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
        setPaginationInfo(result.pageInfo)
        setPage(prev => prev + 1)
      } else {
        setPaginationInfo(result.pageInfo || {})
      }
    } catch (error) {
      console.error("Error loading more items:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, paginationInfo, page, fetchMore])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchMore(undefined, 0)
      setItems(result.items)
      setPaginationInfo(result.pageInfo)
      setPage(1)
    } catch (error) {
      console.error("Error refreshing feed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchMore])

  useEffect(() => {
    const itemsChanged = initialItems.length !== items.length ||
      initialItems.some((item, index) => item?.id !== items[index]?.id)

    if (itemsChanged) {
      setItems(initialItems)
    }
  }, [initialItems]) 

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    refresh,
  }
}