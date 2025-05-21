"use client";

import { useEffect, useRef, useState } from "react";
import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client";
import { MainContentFocus, PageSize } from "@lens-protocol/client";
import { motion } from "motion/react";
import { DraftCreateButton } from "../draft/draft-create-button";
import { GraphicHand2 } from "../icons/custom-icons";
import { PostView } from "./post-view";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { env } from "@/env";
import PostSkeleton from "./post-skeleton";

async function filterBannedPosts(posts: readonly AnyPost[]): Promise<AnyPost[]> {
  if (!posts || posts.length === 0) {
    return [];
  }
  const authorAddresses = [...new Set(posts.map((post) => post.author.address))];

  try {
    const banCheckResponse = await fetch("/api/ban/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addresses: authorAddresses }),
    });
    if (!banCheckResponse.ok) {
      console.error("Failed to fetch ban statuses:", await banCheckResponse.text());
      return posts.slice();
    }
    const banStatusMap: Record<string, boolean> = await banCheckResponse.json();
    return posts.filter((post) => !banStatusMap[post.author.address]);
  } catch (error) {
    console.error("Error during ban check fetch:", error);
    return posts.slice();
  }
}

export const LatestArticleFeed = ({
  initialPosts,
  initialPaginationInfo,
  isUserProfile = false,
}: {
  initialPosts: AnyPost[];
  initialPaginationInfo: Partial<PaginatedResultInfo>;
  isUserProfile?: boolean;
}) => {
  const [allPosts, setAllPosts] = useState<AnyPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPaginationInfo?.next || null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filterInitial = async () => {
      setInitialLoading(true);
      const filtered = await filterBannedPosts(initialPosts);
      setAllPosts(filtered);
      setNextCursor(initialPaginationInfo?.next || null);
      setInitialLoading(false);
    };

    filterInitial();
  }, [initialPosts, initialPaginationInfo]);

  useEffect(() => {
    if (!nextCursor || initialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && nextCursor) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    observerRef.current = observer;
    const currentLoadMoreRef = loadMoreRef.current;

    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      } else if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [nextCursor, loading, initialLoading]);

  const handleLoadMore = async () => {
    if (!nextCursor || loading || initialLoading) return;

    try {
      setLoading(true);
      const lens = await getLensClient();

      const result = await fetchPosts(lens, {
        filter: {
          metadata: { mainContentFocus: [MainContentFocus.Article] },
          feeds: [{ globalFeed: true }],
          apps: [env.NEXT_PUBLIC_APP_ADDRESS],
        },
        cursor: nextCursor,
      }).unwrapOr(null);

      if (result?.items && result.items.length > 0) {
        const fetchedPosts = result.items;
        const cleanPosts = await filterBannedPosts(fetchedPosts);
        setAllPosts((prevPosts) => [...prevPosts, ...cleanPosts]);
      } else {
        console.log("No more items fetched or result is null");
      }

      setNextCursor(result?.pageInfo?.next || null);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const postViews = allPosts
    .map((post) => {
      if (post.__typename !== "Post") {
        return null;
      }

      // if (post.app?.address !== env.NEXT_PUBLIC_APP_ADDRESS) {
      //   return null;
      // }

      if (post.metadata.__typename !== "ArticleMetadata") {
        return null;
      }

      if (!post.metadata.attributes.some((attribute) => attribute.key === "contentJson")) {
        return null;
      }

      return (
        <PostView
          options={{
            showContent: false,
            showAuthor: true,
            showTitle: true,
            showSubtitle: true,
            showBlog: true,
            showDate: true,
            showPreview: true,
          }}
          key={post.id}
          authors={[post.author.address]}
          post={post}
        />
      );
    })
    .filter(Boolean);

  if (initialLoading) {
    return (
      <div className="w-full flex flex-col items-center py-4 gap-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!loading && postViews && postViews.length === 0) {
    return (
      <Card className="m-0 md:m-10 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
        <CardHeader>
          <GraphicHand2 />
        </CardHeader>
        <CardContent>
          <span className="font-[family-name:var(--title-font)] text-lg lg:text-xl text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            Nothing here yet{isUserProfile ? ", but the world awaits your words" : ".."}.
          </span>
        </CardContent>
        <CardFooter>{isUserProfile && <DraftCreateButton text="Start writing" />}</CardFooter>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 my-4 items-center w-full"
    >
      {postViews}

      {/* Show loading skeletons for infinite scroll */}
      {loading && (
        <div className="w-full flex flex-col items-center py-4 gap-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Load more trigger (only render if not loading and there's a next cursor) */}
      {!loading && nextCursor && (
        <div
          ref={loadMoreRef}
          className="h-10 w-full" // Add some height to ensure it can be observed
        />
      )}
    </motion.div>
  );
};
