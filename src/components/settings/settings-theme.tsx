"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import { useStorage } from "@/hooks/use-storage";
import { themeNames, type ThemeType } from "@/styles/themes";
import { ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType } from "@lens-protocol/metadata";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../theme/theme-context";
import { Profile } from "@lens-protocol/react-web";

interface ThemeSettingsProps {
  defaultTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  profile?: Profile | ProfileFragment | null;
}

export function ThemeSettings({ defaultTheme, onThemeChange, profile }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme();
  const { setTheme: setStoredTheme } = useStorage();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(defaultTheme || theme);
  const { saveSettings, isSaving } = useSaveProfileSettings();

  const handleThemeChange = async (newTheme: ThemeType) => {
    if (!profile) {
      setSelectedTheme(newTheme);
      setTheme(newTheme);
      setStoredTheme(newTheme);
      onThemeChange?.(newTheme);
      return;
    }

    try {
      const success = await saveSettings({
        profile,
        attributes: [
          {
            key: "theme",
            type: MetadataAttributeType.STRING,
            value: newTheme,
          },
        ],
      });

      if (success) {
        setSelectedTheme(newTheme);
        setTheme(newTheme);
        setStoredTheme(newTheme);
        onThemeChange?.(newTheme);
      }
    } catch (error) {
      toast.error("Failed to save theme preference");
      console.error("Error saving theme:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="theme">Select Theme</Label>
      <Select onValueChange={handleThemeChange} value={selectedTheme} disabled={isSaving}>
        <SelectTrigger id="theme">
          <SelectValue placeholder={isSaving ? "Saving..." : "Select a theme"} />
        </SelectTrigger>
        <SelectContent>
          {themeNames.map((themeName) => (
            <SelectItem key={themeName} value={themeName}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}