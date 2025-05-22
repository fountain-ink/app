import PostSkeleton from "@/components/post/post-skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full">
      <div className="font-bold text-2xl mb-6">Latest Posts</div>

      <Separator className="w-64 bg-primary mt-1 mb-8" />

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
