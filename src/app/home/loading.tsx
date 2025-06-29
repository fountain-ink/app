import { FeedLayout } from "@/components/navigation/feed-layout";
import PostSkeleton from "@/components/post/post-skeleton";

export default function Loading() {
  return (
    <FeedLayout>
      <div className="flex flex-col gap-4 items-center w-full">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </FeedLayout>
  );
}
