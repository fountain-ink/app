"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import { useStorage } from "@/hooks/use-storage";
import { themeNames, type ThemeType } from "@/styles/themes";
import { ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType } from "@lens-protocol/metadata";
import { Profile } from "@lens-protocol/react-web";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../theme/theme-context";
import { Button } from "../ui/button";

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
  const currentThemeAttribute = profile?.metadata?.attributes?.find((attr) => attr.key === "theme");
  const currentSavedTheme = (currentThemeAttribute?.value as ThemeType) || theme;

  const handleThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const success = await saveSettings({
        profile,
        attributes: [
          {
            key: "theme",
            type: MetadataAttributeType.STRING,
            value: selectedTheme,
          },
        ],
      });

      if (success) {
        setStoredTheme(selectedTheme);
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Customize your interface theme.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Button 
          onClick={handleSave} 
          disabled={isSaving || !profile || selectedTheme === currentSavedTheme}
        >
          {isSaving ? "Saving..." : "Save Theme"}
        </Button>
      </CardContent>
    </Card>
  );
}