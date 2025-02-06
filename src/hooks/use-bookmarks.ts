import { getLensClient } from "@/lib/lens/client";
import { AnyPost } from "@lens-protocol/client";
import { fetchPostBookmarks } from "@lens-protocol/client/actions";
import { useCallback, useRef, useState } from "react";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextCursor = useRef<string | undefined>(undefined);

  const fetchBookmarks = useCallback(
    async (cursor?: string) => {
      if (loading || (cursor && !hasMore)) return;

      setLoading(true);
      try {
        const client = await getLensClient();
        if (client.isPublicClient()) {
          throw new Error("Session client required for bookmarks");
        }

        const result = await fetchPostBookmarks(client, {
          ...(cursor ? { cursor } : {}),
        });

        if (result.isErr()) {
          console.error("Failed to fetch bookmarks:", result.error);
          return;
        }

        const { items, pageInfo } = result.value;
        const newBookmarks = Array.from(items);

        if (!cursor) {
          setBookmarks(newBookmarks);
        } else {
          setBookmarks((prev) => [...prev, ...newBookmarks]);
        }
        nextCursor.current = pageInfo.next ?? undefined;
        setHasMore(!!pageInfo.next);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore],
  );

  const refresh = useCallback(async () => {
    nextCursor.current = undefined;
    setHasMore(true);
    await fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    hasMore,
    nextCursor: nextCursor.current,
    fetchBookmarks,
    refresh,
  };
}; 