"use client"

import { Grid3x3, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedContext } from "@/contexts/feed-context"

export function FeedViewToggle() {
  const { viewMode, setViewMode } = useFeedContext()
  return (
    <div className="flex justify-end mb-4 px-4 sm:px-0">
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setViewMode("single")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            viewMode === "single"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Single column view"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            viewMode === "grid"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Grid view"
        >
          <Grid3x3 className="h-4 w-4" />
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>
    </div>
  )
}