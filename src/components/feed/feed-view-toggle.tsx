"use client"

import { Layout, LayoutDashboard, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedContext } from "@/contexts/feed-context"

export function FeedViewToggle() {
  const { viewMode, setViewMode } = useFeedContext()
  return (
    <div className="flex justify-center items-center">
      <div className="flex">
        <button
          onClick={() => setViewMode("single")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            viewMode === "single"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Single column view"
        >
          <List strokeWidth={2} className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            viewMode === "grid"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Grid view"
        >
          <LayoutDashboard strokeWidth={2} className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}