"use client";

import { settingsEvents } from "@/lib/settings/events";
import { BlogData } from "@/lib/settings/user-settings";
import { useState } from "react";

export function useMetadata(initialMetadata: BlogData = {}) {
  const [metadata, setMetadata] = useState<BlogData>(initialMetadata);
  const [isLoading, setIsLoading] = useState(!Object.keys(initialMetadata).length);

  const saveMetadata = async (newMetadata: BlogData) => {
    try {
      const response = await fetch("/api/metadata", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: newMetadata,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save metadata");
      }

      setMetadata(newMetadata);
      settingsEvents.emit("saved");
      return true;
    } catch (error) {
      console.error("Error saving metadata:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save metadata";
      settingsEvents.emit("error", errorMessage);
      return false;
    }
  };

  return {
    metadata,
    saveMetadata,
    isLoading,
  };
}
