"use client";

import { settingsEvents } from "@/lib/settings/events";
import { useState } from "react";

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

export function useSettings(initialSettings: Settings = {}, initialEmail?: string | null) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [email, setEmail] = useState<string | null>(initialEmail ?? null);
  const [isLoading, setIsLoading] = useState(!Object.keys(initialSettings).length);

  const saveSettings = async (newSettings: Settings, newEmail?: string) => {
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
  };

  return {
    settings,
    email,
    saveSettings,
    isLoading,
  };
}
