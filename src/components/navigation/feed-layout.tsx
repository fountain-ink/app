"use client";

import { FeedViewToggle } from "@/components/feed/feed-view-toggle";
import { useFeedContext } from "@/contexts/feed-context";
import { cn } from "@/lib/utils";
import { FeedNavigation } from "./feed-navigation";

interface FeedLayoutProps {
  children: React.ReactNode;
  hideViewToggle?: boolean;
  wide?: boolean;
}

function FeedLayoutContent({ children, hideViewToggle = false, wide = false }: FeedLayoutProps) {
  const { viewMode } = useFeedContext();

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full">
      <div className={cn("w-full px-0 sm:px-4 mx-auto", "max-w-full")}>
        <div className={cn("mx-auto flex justify-center items-center", "max-w-3xl")}>
          <FeedNavigation />
          {!hideViewToggle && <FeedViewToggle />}
        </div>
      </div>

      <div className="flex flex-col my-4 items-center w-full">
        <div
          className={cn(
            "w-full mx-auto",
            wide ? "max-w-5xl px-4" : viewMode === "grid" && !hideViewToggle ? "max-w-6xl px-4" : "max-w-3xl",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function FeedLayout({ children, hideViewToggle = false, wide = false }: FeedLayoutProps) {
  return (
    <FeedLayoutContent hideViewToggle={hideViewToggle} wide={wide}>
      {children}
    </FeedLayoutContent>
  );
}
