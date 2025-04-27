import PostSkeleton from "@/components/post/post-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      {/* Placeholder for author section */}
      <div className="p-4 w-full flex justify-center">
        <div className="h-4 w-48 bg-muted animate-pulse rounded-full"></div>
      </div>

      {/* Placeholder for title */}
      <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mx-auto mb-4"></div>

      {/* Posts */}
      <div className="flex flex-col py-4 mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
} 