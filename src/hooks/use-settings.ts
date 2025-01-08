"use client";

import { settingsEvents } from "@/lib/settings/events";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Settings {
  blog?: {
    title?: string;
    about?: string;
    showAuthor?: boolean;
    showTags?: boolean;
    showTitle?: boolean;
  };
  app?: {
    isSmoothScrolling?: boolean;
    isBlurEnabled?: boolean;
    email?: string;
  };
  theme?: {
    name?: string;
    customColor?: string;
    customBackground?: string;
  };
}

export function useSettings(initialSettings: Settings = {}) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!Object.keys(initialSettings).length);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings");
      }
      setSettings(data.metadata || {});
      setEmail(data.email);
    } catch (error) {
      console.error("Error fetching settings:", error);
      settingsEvents.emit("error", error instanceof Error ? error.message : "Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useDebouncedCallback(async (newSettings: Settings, newEmail?: string) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          metadata: newSettings,
          ...(newEmail !== undefined && { email: newEmail })
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(newSettings);
      if (newEmail !== undefined) {
        setEmail(newEmail);
      }
      settingsEvents.emit("saved");
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";
      settingsEvents.emit("error", errorMessage);
      return false;
    }
  }, 1000);

  useEffect(() => {
    if (!Object.keys(initialSettings).length) {
      fetchSettings();
    } else {
      setSettings(initialSettings);
    }
  }, [fetchSettings, initialSettings]);

  return {
    settings,
    email,
    saveSettings,
    isLoading,
  };
}
