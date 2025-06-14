"use client"

import { createContext, useContext, ReactNode } from "react"
import { useFeedViewMode } from "@/hooks/use-feed-view-mode"

interface FeedContextValue {
  viewMode: "single" | "grid"
  setViewMode: (mode: "single" | "grid") => void
}

const FeedContext = createContext<FeedContextValue | undefined>(undefined)

interface FeedProviderProps {
  children: ReactNode
  initialViewMode?: "single" | "grid"
}

export function FeedProvider({ children, initialViewMode }: FeedProviderProps) {
  const { viewMode, setViewMode } = useFeedViewMode(initialViewMode)

  return (
    <FeedContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </FeedContext.Provider>
  )
}

export function useFeedContext() {
  const context = useContext(FeedContext)
  if (!context) {
    throw new Error("useFeedContext must be used within a FeedProvider")
  }
  return context
}