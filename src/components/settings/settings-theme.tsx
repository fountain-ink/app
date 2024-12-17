"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import { useStorage } from "@/hooks/use-storage";
import { type ThemeType } from "@/styles/themes";
import type { ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType } from "@lens-protocol/metadata";
import type { Profile } from "@lens-protocol/react-web";
import { useState } from "react";
import { ThemeButtons } from "../theme/theme-buttons";
import { useTheme } from "../theme/theme-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
  const [savedTheme, setSavedTheme] = useState<ThemeType>(() => {
    const currentThemeAttribute = profile?.metadata?.attributes?.find((attr) => attr.key === "theme");
    return (currentThemeAttribute?.value as ThemeType) || theme;
  });
  const [customColor, setCustomColor] = useState("#e2f3ab");
  const [customBackground, setCustomBackground] = useState("#bbccaa");

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
        setSavedTheme(selectedTheme);
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Choose a preset or make your own theme.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger disabled value="custom">
              Custom
            </TabsTrigger>
          </TabsList>
          <TabsContent value="presets">
            <ThemeButtons currentTheme={savedTheme} onChange={handleThemeChange} disabled={isSaving} />
          </TabsContent>
          <TabsContent value="custom">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Leading Color
                </Label>
                <Input
                  id="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="background" className="text-right">
                  Background Color
                </Label>
                <Input
                  id="background"
                  value={customBackground}
                  onChange={(e) => setCustomBackground(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || !profile || selectedTheme === savedTheme}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
