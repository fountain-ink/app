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
      <div className="w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        <FeedViewToggle />
        <FeedNavigation />
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