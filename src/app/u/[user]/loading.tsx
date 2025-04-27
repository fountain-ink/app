import PostSkeleton from "@/components/post/post-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 py-4 items-center w-full">
      <PostSkeleton />
    </div>
  );
} 