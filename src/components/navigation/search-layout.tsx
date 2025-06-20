"use client";

import { useFeedContext } from "@/contexts/feed-context";
import { cn } from "@/lib/utils";

interface SearchLayoutProps {
  children: React.ReactNode;
}

export function SearchLayout({ children }: SearchLayoutProps) {
  const { viewMode } = useFeedContext();

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full">
      <div className="flex flex-col items-center w-full">
        <div className={cn("w-full mx-auto", viewMode === "grid" ? "max-w-6xl px-4" : "max-w-3xl")}>{children}</div>
      </div>
    </div>
  );
}
