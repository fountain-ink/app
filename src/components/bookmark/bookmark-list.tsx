"use client";

import { useEffect } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { GraphicHand2 } from "../icons/custom-icons";
import PostSkeleton from "../post/post-skeleton";
import { PostView } from "../post/post-view";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

export const BookmarkList = () => {
  const { bookmarks, loading, hasMore, fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (loading && bookmarks.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!loading && bookmarks && bookmarks.length === 0) {
    return (
      <Card className="m-0 md:m-10 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
        <CardHeader>
          <GraphicHand2 />
        </CardHeader>
        <CardContent>
          <span className="font-[family-name:var(--title-font)] text-lg lg:text-xl text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            No bookmarks yet. Start exploring and save your favorite posts.
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookmarks.map((post) => {
        if (post.__typename !== "Post") return null;
        if (post.metadata?.__typename !== "ArticleMetadata") return null;
        return (
          <PostView
            key={post.id}
            post={post}
            authors={[post.author.address]}
            options={{
              showAuthor: false,
              showTitle: true,
              showSubtitle: true,
              showDate: true,
              showPreview: true,
              showContent: false,
            }}
          />
        );
      })}
      {hasMore && (
        <Button
          variant="outline"
          onClick={() => fetchBookmarks(bookmarks[bookmarks.length - 1]?.id)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </Button>
      )}
    </div>
  );
};
