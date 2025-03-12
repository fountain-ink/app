import { settingsEvents } from "@/lib/settings/events";
import { useState } from "react";
import { Database } from "@/lib/supabase/database";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { BlogData } from "@/lib/settings/get-blog-data";

export function useBlogSettings(initialSettings: BlogData) {
  const [settings, setSettings] = useState<BlogData>(initialSettings);
  const [isLoading, setIsLoading] = useState(!initialSettings);

  const saveSettings = async (newSettings: Partial<BlogData>) => {
    try {
      const response = await fetch(`/api/blogs/${settings.address}`, {
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

      setSettings((current) => ({ ...current, ...newSettings }));
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
