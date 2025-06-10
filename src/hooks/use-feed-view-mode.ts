"use client"

import { useEffect, useState } from "react"
import { useLocalStorage } from "./use-local-storage"

export function useFeedViewMode() {
  const [savedViewMode, setSavedViewMode] = useLocalStorage<"single" | "grid">(
    "feed-view-mode",
    "single"
  )
  const [viewMode, setViewMode] = useState<"single" | "grid">("single")

  // Initialize from local storage after mount
  useEffect(() => {
    setViewMode(savedViewMode)
  }, [savedViewMode])

  const handleViewModeChange = (mode: "single" | "grid") => {
    setViewMode(mode)
    setSavedViewMode(mode)
  }

  return {
    viewMode,
    setViewMode: handleViewModeChange
  }
}