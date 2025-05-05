"use client";

import { useEffect, useRef, useState } from "react";
import type { AnyPost, PaginatedResultInfo } from "@lens-protocol/client";
import { MainContentFocus } from "@lens-protocol/client";
import { motion } from "motion/react";
import { DraftCreateButton } from "../draft/draft-create-button";
import { GraphicHand2 } from "../icons/custom-icons";
import { PostView } from "./post-view";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { env } from "@/env";
import PostSkeleton from "./post-skeleton";

export const PaginatedArticleFeed = ({
  initialPosts,
  initialPaginationInfo,
  isUserProfile = false,
}: {
  initialPosts: AnyPost[];
  initialPaginationInfo: Partial<PaginatedResultInfo>;
  isUserProfile?: boolean;
}) => {
  const [allPosts, setAllPosts] = useState<AnyPost[]>([...initialPosts]);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPaginationInfo?.next || null);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllPosts([...initialPosts]);
    setNextCursor(initialPaginationInfo?.next || null);
  }, [initialPosts, initialPaginationInfo]);

  useEffect(() => {
    if (!nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && nextCursor) {
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
  }, [nextCursor, loading]);

  const handleLoadMore = async () => {
    if (!nextCursor || loading) return;

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

      if (result?.items) {
        const newPosts = [...result.items];
        setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }

      setNextCursor(result?.pageInfo?.next || null);
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
  }).filter(Boolean);

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

      {nextCursor && (
        <div
          ref={loadMoreRef}
          className="w-full flex flex-col items-center py-4 gap-4"
        >
          {loading && (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}; 