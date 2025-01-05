"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { isValidTheme, type ThemeType } from "@/styles/themes";
import { useEffect, useState } from "react";
import { ThemeButtons } from "../theme/theme-buttons";
import { useTheme } from "../theme/theme-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ThemeSettingsProps {
  defaultTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
}

export function ThemeSettings({ defaultTheme, onThemeChange }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme();
  const { settings, saveSettings, isSaving } = useSettings();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(() => {
    const themeName = settings.theme?.name;
    return isValidTheme(themeName) ? themeName : theme;
  });
  const [customColor, setCustomColor] = useState(settings.theme?.customColor || "#e2f3ab");
  const [customBackground, setCustomBackground] = useState(settings.theme?.customBackground || "#bbccaa");

  useEffect(() => {
    const themeName = settings.theme?.name;
    if (isValidTheme(themeName)) {
      setSelectedTheme(themeName);
    }
    setCustomColor(settings.theme?.customColor || "#e2f3ab");
    setCustomBackground(settings.theme?.customBackground || "#bbccaa");
  }, [settings, theme]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings({
        ...settings,
        theme: {
          name: selectedTheme,
          customColor,
          customBackground,
        },
      });

      if (success) {
        setTheme(selectedTheme);
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
            <ThemeButtons currentTheme={selectedTheme} onChange={handleThemeChange} disabled={isSaving} />
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || selectedTheme === settings.theme?.name}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
