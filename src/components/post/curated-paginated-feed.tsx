"use client";

import { useEffect, useRef, useState } from "react";
import type { AnyPost } from "@lens-protocol/client";
import { MainContentFocus } from "@lens-protocol/client";
import { motion } from "motion/react";
import { DraftCreateButton } from "../draft/draft-create-button";
import { GraphicHand2 } from "../icons/custom-icons";
import { PostView } from "./post-view";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Loader2 } from "lucide-react";
import { getLensClient } from "@/lib/lens/client";
import { fetchPost } from "@lens-protocol/client/actions";
import { env } from "@/env";

export const CuratedPaginatedFeed = ({
  initialPostIds = [],
  initialPosts = [],
  hasMore = false,
  page = 1,
}: {
  initialPostIds?: string[];
  initialPosts?: AnyPost[];
  hasMore?: boolean;
  page?: number;
}) => {
  const [allPosts, setAllPosts] = useState<AnyPost[]>(initialPosts);
  const [loadedPostIds, setLoadedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMorePosts, setHasMorePosts] = useState(hasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initialize loadedPostIds with initialPosts IDs
  useEffect(() => {
    if (initialPosts.length > 0) {
      setLoadedPostIds(new Set(initialPosts.map(post => post.id)));
    }
  }, [initialPosts]);

  // Fetch posts by IDs when component mounts or IDs change
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
      { threshold: 0.5 }
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

      // Filter out already loaded post IDs
      const newPostIds = postIds.filter(id => !loadedPostIds.has(id));

      if (newPostIds.length === 0) {
        setLoading(false);
        return;
      }

      for (const id of newPostIds) {
        try {
          // Use the correct parameter for the Lens API
          const result = await fetchPost(lens, { post: id });

          if (result.isOk()) {
            const post = result.value;
            if (post) {
              fetchedPosts.push(post);
              // Add to loaded post IDs
              setLoadedPostIds(prev => new Set([...prev, post.id]));
            }
          }
        } catch (error) {
          console.error(`Failed to fetch post ${id}:`, error);
        }
      }

      // Only add unique posts
      setAllPosts(prevPosts => {
        const existingPostIds = new Set(prevPosts.map(post => post.id));
        const uniqueNewPosts = fetchedPosts.filter(post => !existingPostIds.has(post.id));
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

  const postViews = allPosts.map((post) => {
    if (post.__typename !== "Post") {
      return null;
    }

    if (post.app?.address !== env.NEXT_PUBLIC_APP_ADDRESS) {
      return null;
    }

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
  }).filter(Boolean);

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
        <CardFooter></CardFooter>
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

      {hasMorePosts && (
        <div
          ref={loadMoreRef}
          className="w-full flex justify-center py-4"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
        </div>
      )}
    </motion.div>
  );
}; 