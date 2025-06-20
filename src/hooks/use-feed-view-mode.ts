"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";

export function useFeedViewMode(initialMode?: "single" | "grid") {
  const [savedViewMode, setSavedViewMode] = useLocalStorage<"single" | "grid">("feed-view-mode", "single");
  const [viewMode, setViewMode] = useState<"single" | "grid">(initialMode || "single");

  useEffect(() => {
    if (!initialMode) {
      setViewMode(savedViewMode);
    }
  }, [savedViewMode, initialMode]);

  const handleViewModeChange = (mode: "single" | "grid") => {
    setViewMode(mode);
    setSavedViewMode(mode);
  };

  return {
    viewMode,
    setViewMode: handleViewModeChange,
  };
}
