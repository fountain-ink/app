"use client"

import { cn } from "@/lib/utils"
import { FeedNavigation } from "./feed-navigation"
import { FeedViewToggle } from "@/components/feed/feed-view-toggle"
import { useFeedContext } from "@/contexts/feed-context"

interface FeedLayoutProps {
  children: React.ReactNode
}

function FeedLayoutContent({ children }: FeedLayoutProps) {
  const { viewMode } = useFeedContext()

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full">
      <div className="w-full max-w-full px-0 sm:px-4 mx-auto">
        <div className="max-w-3xl mx-auto flex justify-center items-center">
          <FeedNavigation />
          <FeedViewToggle />
        </div>
      </div>

      <div className="flex flex-col my-4 items-center w-full">
        <div className={cn(
          "w-full",
          viewMode === "grid"
            ? "max-w-6xl mx-auto px-4"
            : "max-w-3xl mx-auto"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function FeedLayout({ children }: FeedLayoutProps) {
  return <FeedLayoutContent>{children}</FeedLayoutContent>
}