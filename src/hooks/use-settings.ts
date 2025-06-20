"use client";

import { useState } from "react";
import { settingsEvents } from "@/lib/settings/events";
import { UserSettings } from "@/lib/settings/user-settings";

export function useSettings(initialSettings: UserSettings = {}) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(!Object.keys(initialSettings).length);

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      const response = await fetch("/api/settings", {
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

      setSettings(newSettings);
      settingsEvents.emit("saved");
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";
      settingsEvents.emit("error", errorMessage);
      return false;
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings");
      }

      setSettings(data.settings);
      return data.settings;
    } catch (error) {
      console.error("Error fetching settings:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    saveSettings,
    fetchSettings,
    isLoading,
  };
}
