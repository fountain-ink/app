"use client";

import { Suspense } from "react";
import PostSkeleton from "./post-skeleton";

export function PostSkeletonBoundary({
  children,
  count = 5,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 items-center w-full">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <PostSkeleton key={i} />
            ))}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
