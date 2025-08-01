"use client";

import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client";
import { MainContentFocus } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { ChevronDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useFeedContext } from "@/contexts/feed-context";
import { env } from "@/env";
import { filterBannedPosts, useBanFilter } from "@/hooks/use-ban-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteFeed } from "@/hooks/use-infinite-feed";
import { getLensClient } from "@/lib/lens/client";
import { Feed, isValidArticlePost, renderArticlePost } from "./feed";
import { FeedViewToggle } from "./feed-view-toggle";

export interface SearchFeedProps {
  initialPosts: AnyPost[];
  initialPaginationInfo: Partial<PaginatedResultInfo>;
  initialQuery: string;
  initialTag?: string;
  preFilteredPosts?: boolean;
}

export function SearchFeed({
  initialPosts,
  initialPaginationInfo,
  initialQuery,
  initialTag = "",
  preFilteredPosts = false,
}: SearchFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode } = useFeedContext();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [filteredInitialPosts, setFilteredInitialPosts] = useState<AnyPost[]>(preFilteredPosts ? initialPosts : []);
  const [isInitializing, setIsInitializing] = useState(!preFilteredPosts);
  const [isSearching, setIsSearching] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const { checkBanStatus } = useBanFilter();

  useEffect(() => {
    if (!preFilteredPosts) {
      filterBannedPosts(initialPosts, checkBanStatus).then((filtered) => {
        setFilteredInitialPosts(filtered);
        setIsInitializing(false);
      });
    }
  }, [initialPosts, checkBanStatus, preFilteredPosts]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    if (selectedTag) {
      params.set("tag", selectedTag);
    } else {
      params.delete("tag");
    }

    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    router.push(newUrl, { scroll: false });
  }, [debouncedQuery, selectedTag, router, searchParams]);

  const fetchMore = useCallback(
    async (cursor?: string) => {
      if (!debouncedQuery && !selectedTag) {
        return { items: [], pageInfo: undefined };
      }

      const lens = await getLensClient();

      const actualCursor = cursor === "initial" ? undefined : cursor;

      const result = await fetchPosts(lens, {
        filter: {
          metadata: {
            mainContentFocus: [MainContentFocus.Article],
            tags: selectedTag ? { oneOf: [selectedTag] } : undefined,
          },
          searchQuery: debouncedQuery || undefined,
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
    [debouncedQuery, selectedTag, checkBanStatus],
  );

  const { items, isLoading, hasMore, loadMore, reset } = useInfiniteFeed({
    initialItems: filteredInitialPosts,
    initialPaginationInfo,
    fetchMore,
  });

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery === initialQuery && selectedTag === initialTag) return;

      setIsSearching(true);
      reset();

      if (debouncedQuery || selectedTag) {
        const result = await fetchMore();
        if (result.items.length > 0) {
          reset(result.items, result.pageInfo || {});
        }
      }

      setIsSearching(false);
    };

    performSearch();
  }, [debouncedQuery, selectedTag, fetchMore, initialQuery, initialTag, reset]);

  const renderPost = useCallback(
    (post: AnyPost, index: number) => {
      return renderArticlePost(post, viewMode, { showAuthor: true }, index);
    },
    [viewMode],
  );

  const validPosts = useMemo(() => items.filter(isValidArticlePost), [items]);

  const showResults = (debouncedQuery || selectedTag) && !isSearching;
  const showEmpty = showResults && validPosts.length === 0 && !isLoading && !isInitializing;
  const showPrompt = !debouncedQuery && !selectedTag && !isSearching;

  const commonTags = [
    "web3",
    "blockchain",
    "WriteOnChain",
    "crypto",
    "defi",
    "nft",
    "milady",
    "remilio",
    "fountain",
    "deso",
    "ethereum",
    "bitcoin",
    "technology",
    "code",
    "ai",
    "art",
    "music",
    "philosophy",
    "politics",
    "science",
  ];

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? "" : tag);
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="w-full space-y-6">
      <div className="top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-4">
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

          <Collapsible open={isTagsExpanded} onOpenChange={setIsTagsExpanded}>
            {!isTagsExpanded ? (
              <div className="flex items-center gap-2 relative">
                <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide scroll-smooth" id="tags-scroll">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors whitespace-nowrap ${
                        selectedTag === tag
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-secondary/50"
                      }`}
                    >
                      {capitalizeFirstLetter(tag)}
                    </button>
                  ))}
                </div>
                <CollapsibleTrigger asChild>
                  <button className="p-2 rounded-md hover:bg-secondary/50 transition-colors">
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </button>
                </CollapsibleTrigger>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Browse tags</span>
                  <CollapsibleTrigger asChild>
                    <button className="p-2 rounded-md hover:bg-secondary/50 transition-colors">
                      <ChevronDown className="h-4 w-4 rotate-180 transition-transform duration-200" />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          selectedTag === tag
                            ? "bg-primary text-primary-foreground"
                            : "border border-border hover:bg-secondary/50"
                        }`}
                      >
                        {capitalizeFirstLetter(tag)}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </>
            )}
          </Collapsible>
        </div>
      </div>

      {showPrompt && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Search for articles</h3>
          <p className="text-sm text-muted-foreground">Enter keywords to find articles on Fountain</p>
        </div>
      )}

      {showEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="mb-2 text-lg font-semibold">No results found</h3>
          <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
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
  );
}
