import PostSkeleton from "@/components/post/post-skeleton";
import { FeedNavigation } from "@/components/navigation/feed-navigation";

export default function Loading() {
  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      <FeedNavigation />

      <div className="flex flex-col gap-4 my-4 items-center w-full">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
} 