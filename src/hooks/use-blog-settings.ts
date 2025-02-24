import { settingsEvents } from "@/lib/settings/events";
import { useState } from "react";
import { Database } from "@/lib/supabase/database";

export interface BlogMetadata {
  showAuthor?: boolean;
  showTags?: boolean;
  showTitle?: boolean;
}

export type BlogSettings = Omit<Database["public"]["Tables"]["blogs"]["Row"], "metadata"> & {
  metadata?: BlogMetadata | null;
};

export function useBlogSettings(blogAddress: string, initialSettings: BlogSettings) {
  const [settings, setSettings] = useState<BlogSettings>( initialSettings );
  const [isLoading, setIsLoading] = useState(!initialSettings);

  const saveSettings = async (newSettings: Partial<BlogSettings>) => {
    try {
      const response = await fetch(`/api/blogs/${blogAddress}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: newSettings,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(current => ({ ...current, ...newSettings }));
      settingsEvents.emit("saved");
      return true;
    } catch (error) {
      console.error("Error saving blog settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";
      settingsEvents.emit("error", errorMessage);
      return false;
    }
  };

  return {
    settings,
    saveSettings,
    isLoading,
  };
} 