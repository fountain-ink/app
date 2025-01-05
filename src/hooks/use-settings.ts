import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Settings {
  blog?: {
    title?: string;
    showAuthor?: boolean;
    showTags?: boolean;
    showTitle?: boolean;
  };
  app?: {
    isSmoothScrolling?: boolean;
    isBlurEnabled?: boolean;
  };
  theme?: {
    name?: string;
    customColor?: string;
    customBackground?: string;
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings");
      }
      setSettings(data.metadata || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata: newSettings }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(newSettings);
      toast.success("Settings saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    saveSettings,
    isSaving,
    isLoading,
  };
} 