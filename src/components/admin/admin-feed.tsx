"use client";

import { useEffect, useRef, useState } from "react";
import type { AnyPost, Post, PaginatedResultInfo } from "@lens-protocol/client";
import { MainContentFocus } from "@lens-protocol/client";
import { motion } from "motion/react";
import { GraphicHand2 } from "../icons/custom-icons";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Loader2 } from "lucide-react";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { env } from "@/env";
import { CuratedPostView } from "./admin-post-view";

interface CuratedItem {
  id: number;
  slug: string;
  created_at: string;
  added_by: string | null;
}

interface BanItem {
  address: string;
  reason: string;
  created_at: string;
  added_by: string | null;
}

export const CuratedPaginatedFeed = ({
  initialPosts,
  initialPaginationInfo,
}: {
  initialPosts: AnyPost[];
  initialPaginationInfo: Partial<PaginatedResultInfo>;
}) => {
  const [allPosts, setAllPosts] = useState<AnyPost[]>([...initialPosts]);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPaginationInfo?.next || null);
  const [loading, setLoading] = useState(false);
  const [curatedSlugs, setCuratedSlugs] = useState<string[]>([]);
  const [bannedAddresses, setBannedAddresses] = useState<Record<string, string>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    setAllPosts([...initialPosts]);
    setNextCursor(initialPaginationInfo?.next || null);
    fetchCuratedPosts();
    fetchBannedAuthors();
  }, [initialPosts, initialPaginationInfo]);

  // Load more posts on scroll
  useEffect(() => {
    if (!nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && nextCursor) {
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
  }, [nextCursor, loading]);

  const fetchCuratedPosts = async () => {
    try {
      const response = await fetch("/api/admin/curate");

      if (!response.ok) {
        throw new Error("Failed to fetch curated posts");
      }

      const result = await response.json();
      const data = result.data as CuratedItem[];

      if (data) {
        setCuratedSlugs(data.map((item: CuratedItem) => item.slug).filter(Boolean));
      }
    } catch (error) {
      console.error("Failed to fetch curated posts:", error);
    }
  };

  const fetchBannedAuthors = async () => {
    try {
      const response = await fetch("/api/admin/ban");

      if (!response.ok) {
        throw new Error("Failed to fetch banned authors");
      }

      const result = await response.json();
      const data = result.data as BanItem[];

      if (data) {
        const bannedMap: Record<string, string> = {};
        data.forEach((item: BanItem) => {
          if (item.address && item.reason) {
            bannedMap[item.address] = item.reason;
          }
        });
        setBannedAddresses(bannedMap);
      }
    } catch (error) {
      console.error("Failed to fetch banned authors:", error);
    }
  };

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

  const handleCurationChange = async (post: Post, isCurated: boolean) => {
    if (isCurated) {
      setCuratedSlugs([...curatedSlugs, post.slug]);
    } else {
      setCuratedSlugs(curatedSlugs.filter((slug) => slug !== post.slug));
    }
  };

  const handleBanChange = async (post: Post, isBanned: boolean, reason?: string) => {
    const newBannedAddresses = { ...bannedAddresses };

    if (isBanned && reason) {
      newBannedAddresses[post.author.address] = reason;
    } else {
      delete newBannedAddresses[post.author.address];
    }

    setBannedAddresses(newBannedAddresses);
  };

  const postViews = allPosts
    .map((post) => {
      if (post.__typename !== "Post") {
        return null;
      }

      if (post.metadata.__typename !== "ArticleMetadata") {
        return null;
      }

      if (!post.metadata.attributes.some((attribute) => attribute.key === "contentJson")) {
        return null;
      }

      const isCurated = curatedSlugs.includes(post.slug);
      const isAuthorBanned = !!bannedAddresses[post.author.address];
      const banReason = bannedAddresses[post.author.address] || null;

      return (
        <CuratedPostView
          key={post.id}
          post={post}
          authors={[post.author.address]}
          isCurated={isCurated}
          isAuthorBanned={isAuthorBanned}
          banReason={banReason}
          onCurationChange={handleCurationChange}
          onBanChange={handleBanChange}
        />
      );
    })
    .filter(Boolean);

  if (postViews.length === 0) {
    return (
      <Card className="m-4 bg-transparent group border flex flex-col gap-4 items-center justify-center shadow-sm">
        <CardHeader>
          <GraphicHand2 />
        </CardHeader>
        <CardContent>
          <span className="font-[family-name:var(--title-font)] text-lg lg:text-xl text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            No posts found.
          </span>
        </CardContent>
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
        <div ref={loadMoreRef} className="w-full flex justify-center py-4">
          {loading && <Loader2 className="animate-spin" size={20} />}
        </div>
      )}
    </motion.div>
  );
};
