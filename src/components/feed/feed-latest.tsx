"use client";

import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client";
import { MainContentFocus } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFeedContext } from "@/contexts/feed-context";
import { env } from "@/env";
import { filterBannedPosts, useBanFilter } from "@/hooks/use-ban-filter";
import { useInfiniteFeed } from "@/hooks/use-infinite-feed";
import { getLensClient } from "@/lib/lens/client";
import { Feed, isValidArticlePost, renderArticlePost, UserProfileEmptyState } from "./feed";

export interface LatestFeedProps {
  initialPosts: AnyPost[];
  initialPaginationInfo: Partial<PaginatedResultInfo>;
  isUserProfile?: boolean;
  preFilteredPosts?: boolean;
}

export function LatestFeed({
  initialPosts,
  initialPaginationInfo,
  isUserProfile = false,
  preFilteredPosts = false,
}: LatestFeedProps) {
  const { viewMode } = useFeedContext();
  const [filteredInitialPosts, setFilteredInitialPosts] = useState<AnyPost[]>(preFilteredPosts ? initialPosts : []);
  const [isInitializing, setIsInitializing] = useState(!preFilteredPosts);
  const { checkBanStatus } = useBanFilter();

  // Filter initial posts once component mounts (only if not pre-filtered)
  useEffect(() => {
    if (!preFilteredPosts) {
      filterBannedPosts(initialPosts, checkBanStatus).then((filtered) => {
        setFilteredInitialPosts(filtered);
        setIsInitializing(false);
      });
    }
  }, [initialPosts, checkBanStatus, preFilteredPosts]);

  const fetchMore = useCallback(
    async (cursor?: string) => {
      const lens = await getLensClient();

      const actualCursor = cursor === "initial" ? undefined : cursor;

      const result = await fetchPosts(lens, {
        filter: {
          metadata: { mainContentFocus: [MainContentFocus.Article] },
          feeds: [{ globalFeed: true }],
          apps: [env.NEXT_PUBLIC_APP_ADDRESS],
        },
        cursor: actualCursor,
      }).unwrapOr(null);

      if (!result) {
        return { items: [], pageInfo: undefined };
      }

      const filtered = await filterBannedPosts(result.items, checkBanStatus);
      return { items: filtered, pageInfo: result.pageInfo };
    },
    [checkBanStatus],
  );

  const { items, isLoading, hasMore, loadMore } = useInfiniteFeed({
    initialItems: filteredInitialPosts,
    initialPaginationInfo,
    fetchMore,
  });

  const renderPost = useCallback(
    (post: AnyPost, index: number) => {
      return renderArticlePost(post, viewMode, { showAuthor: true }, index);
    },
    [viewMode],
  );

  const validPosts = useMemo(() => items.filter(isValidArticlePost), [items]);
  if (validPosts.length === 0 && !isLoading && !isInitializing && isUserProfile) {
    return <UserProfileEmptyState />;
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
  );
}
