"use client";

import { useEffect, useRef, useState } from "react";
import type { AnyPost, Post } from "@lens-protocol/client";
import { motion } from "motion/react";
import { GraphicHand2 } from "../icons/custom-icons";
import { PostView } from "./post-view";
import { PostVerticalView } from "./post-vertical-view";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { env } from "@/env";
import PostSkeleton from "./post-skeleton";
import { cn } from "@/lib/utils";

export const CuratedPaginatedFeed = ({
  initialPostIds = [],
  initialPosts = [],
  hasMore = false,
  page = 1,
  viewMode = "single",
}: {
  initialPostIds?: string[];
  initialPosts?: AnyPost[];
  hasMore?: boolean;
  page?: number;
  viewMode?: "single" | "grid";
}) => {
  const [allPosts, setAllPosts] = useState<AnyPost[]>(initialPosts);
  const [loadedPostIds, setLoadedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMorePosts, setHasMorePosts] = useState(hasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPosts.length > 0) {
      setLoadedPostIds(new Set(initialPosts.map((post) => post.id)));
    }
  }, [initialPosts]);

  useEffect(() => {
    if (initialPostIds.length > 0 && initialPosts.length === 0) {
      fetchPostsByIds(initialPostIds);
    }
  }, [initialPostIds]);

  useEffect(() => {
    if (!hasMorePosts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && hasMorePosts) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMorePosts, loading]);

  const fetchPostsByIds = async (postIds: string[]) => {
    if (!postIds.length) return;

    setLoading(true);
    try {
      const lens = await getLensClient();
      const fetchedPosts: AnyPost[] = [];

      const newPostIds = postIds.filter((id) => !loadedPostIds.has(id));

      if (newPostIds.length === 0) {
        setLoading(false);
        return;
      }

      const result = await fetchPosts(lens, { filter: { posts: newPostIds } });

      if (result.isOk()) {
        const posts = result.value.items;
        if (posts && posts.length > 0) {
          fetchedPosts.push(...posts);
          setLoadedPostIds((prev) => {
            const newIds = new Set(prev);
            posts.forEach((post) => newIds.add(post.id));
            return newIds;
          });
        }
      } else {
        console.error("Failed to fetch posts batch:", result.error);
      }

      setAllPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((post) => post.id));
        const uniqueNewPosts = fetchedPosts.filter((post) => !existingPostIds.has(post.id));
        return [...prevPosts, ...uniqueNewPosts];
      });
    } catch (error) {
      console.error("Failed to fetch posts by IDs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loading || !hasMorePosts) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;

      // Use the public API endpoint instead of the admin one
      const response = await fetch(`/api/curate?page=${nextPage}&limit=10`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const newPostIds = data.data.map((item: any) => item.slug);
        await fetchPostsByIds(newPostIds);
        setCurrentPage(nextPage);
        setHasMorePosts(data.hasMore);
      } else {
        setHasMorePosts(false);
      }
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

      const commonOptions = {
        showContent: false,
        showAuthor: true,
        showTitle: true,
        showSubtitle: true,
        showBlog: true,
        showDate: true,
        showPreview: true,
      };

      if (viewMode === "grid") {
        return (
          <div key={post.id} className="break-inside-avoid mb-6">
            <PostVerticalView
              options={commonOptions}
              authors={[post.author.address]}
              post={post as Post}
            />
          </div>
        );
      }

      return (
        <PostView
          options={commonOptions}
          key={post.id}
          authors={[post.author.address]}
          post={post}
        />
      );
    })
    .filter(Boolean);

  if (postViews.length === 0 && !loading) {
    return (
      <Card className="m-0 md:m-10 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
        <CardHeader>
          <GraphicHand2 />
        </CardHeader>
        <CardContent>
          <span className="font-[family-name:var(--title-font)] text-lg lg:text-xl text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            No curated posts available yet.
          </span>
        </CardContent>
        <CardFooter />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full",
        viewMode === "grid" 
          ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6" 
          : "flex flex-col gap-4 items-center"
      )}
    >
      {postViews}

      {/* Show loading skeletons for infinite scroll */}
      {loading && viewMode === "grid" && (
        <>
          {[...Array(6)].map((_, i) => (
            <div key={`skeleton-${i}`} className="break-inside-avoid mb-6">
              <div className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-xl mb-3" />
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {loading && viewMode === "single" && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* Load more trigger */}
      {hasMorePosts && !loading && (
        <div ref={loadMoreRef} className="h-10 w-full" />
      )}
    </motion.div>
  );
};
