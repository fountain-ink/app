import { cn } from "@/lib/utils";

interface PostSkeletonProps {
  isVertical?: boolean;
  className?: string;
}

export const PostSkeleton = ({ isVertical = false, className }: PostSkeletonProps = {}) => {
  if (isVertical) {
    return (
      <div className={cn("group relative flex flex-col w-full", className)}>
        {/* Image skeleton */}
        <div className="relative w-full aspect-[4/3] bg-muted rounded-xl mb-3 overflow-hidden">
          <div className="h-full w-full animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          {/* Author info skeleton - matching font size [13px] */}
          <div className="flex flex-row items-center w-full gap-1 mb-2 font-[family-name:var(--paragraph-font)] text-[13px]">
            <div className="h-[13px] w-24 bg-muted rounded animate-pulse" />
            <div className="h-[13px] w-20 bg-muted rounded animate-pulse ml-2" />
          </div>

          {/* Title skeleton - matching text-[1.25rem] */}
          <div className="h-[1.875rem] bg-muted rounded w-11/12 animate-pulse mb-1" />

          {/* Subtitle skeleton - matching text-base with line-clamp-3 */}
          <div className="space-y-1">
            <div className="h-[1.3125rem] bg-muted rounded w-full animate-pulse" />
            <div className="h-[1.3125rem] bg-muted rounded w-10/12 animate-pulse" />
            <div className="h-[1.3125rem] bg-muted rounded w-7/12 animate-pulse" />
          </div>

          {/* Bottom row skeleton - always visible but with low opacity to maintain height */}
          <div className="flex items-center justify-between mt-3 h-8 opacity-30">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-12 bg-muted rounded animate-pulse" />
              <div className="h-6 w-6 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div
      className="group/post flex flex-row items-start justify-start gap-4 sm:gap-6 md:gap-8 lg:gap-10
      bg-transparent hover:text-card-foreground transition-all ease-in duration-100
      border-0 shadow-none relative w-screen rounded-sm p-4
      max-w-full sm:max-w-3xl h-fit leading-tight"
    >
      {/* Preview image skeleton */}
      <div className="h-40 w-40 shrink-0 aspect-square rounded-md overflow-hidden bg-muted animate-pulse">
        <div className="h-full w-full relative" />
      </div>

      <div className="flex flex-col w-full h-full min-h-40 gap-2">
        <div className="flex flex-col gap-2">
          {/* Author skeleton */}
          <div className="flex flex-row items-center w-full z-10 gap-1">
            <div className="h-5 w-28 bg-muted rounded-full animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="h-8 bg-muted rounded-md w-3/4 animate-pulse my-1" />

          {/* Subtitle skeleton */}
          <div className="h-6 bg-muted rounded-md w-5/6 animate-pulse mt-2" />

          {/* Content skeleton
          <div className="flex flex-col gap-2 mt-1">
            <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
            <div className="h-4 bg-muted rounded-md w-11/12 animate-pulse" />
          </div> */}
        </div>

        {/* Date and reactions skeleton */}
        <div className="flex flex-row items-center justify-between text-sm tracking-wide relative z-10 mt-auto">
          <div className="flex flex-row items-center gap-3">
            <div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
            <div className="flex flex-row gap-2">
              <div className="h-4 w-96 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="h-4 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Deprecated - use PostSkeleton with isVertical prop instead
export const PostVerticalSkeleton = () => {
  return <PostSkeleton isVertical={true} />;
};

export default PostSkeleton;
