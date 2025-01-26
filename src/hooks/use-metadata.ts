"use client";

import { settingsEvents } from "@/lib/settings/events";
import { UserMetadata } from "@/lib/settings/types";
import { useState } from "react";

export function useMetadata(initialMetadata: UserMetadata = {}) {
  const [metadata, setMetadata] = useState<UserMetadata>(initialMetadata);
  const [isLoading, setIsLoading] = useState(!Object.keys(initialMetadata).length);

  const saveMetadata = async (newMetadata: UserMetadata) => {
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