"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { isValidTheme, type ThemeType } from "@/styles/themes";
import { useEffect, useState } from "react";
import { ThemeButtons } from "../theme/theme-buttons";
import { useTheme } from "../theme/theme-context";
import { Input } from "../ui/input";

interface ThemeSettingsProps {
  defaultTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  initialSettings?: any;
}

export function ThemeSettings({ defaultTheme, onThemeChange, initialSettings = {} }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme();
  const { settings, saveSettings } = useSettings(initialSettings);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(() => {
    const themeName = settings.theme?.name;
    return isValidTheme(themeName) ? themeName : theme;
  });
  const [customColor, setCustomColor] = useState(settings.theme?.customColor || "#e2f3ab");
  const [customBackground, setCustomBackground] = useState(settings.theme?.customBackground || "#bbccaa");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const themeName = settings.theme?.name;
    if (isValidTheme(themeName)) {
      setSelectedTheme(themeName);
    }
    setCustomColor(settings.theme?.customColor || "#e2f3ab");
    setCustomBackground(settings.theme?.customBackground || "#bbccaa");
    setIsDirty(false);
  }, [settings, theme]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    onThemeChange?.(newTheme);
    setIsDirty(true);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setIsDirty(true);
  };

  const handleCustomBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBackground = e.target.value;
    setCustomBackground(newBackground);
    setIsDirty(true);
  };

  const handleSave = async () => {
    const success = await saveSettings({
      ...settings,
      theme: {
        name: selectedTheme,
        customColor,
        customBackground,
      },
    });
    if (success) {
      setIsDirty(false);
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
            <ThemeButtons currentTheme={selectedTheme} onChange={handleThemeChange} />
          </TabsContent>
          <TabsContent value="custom">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Leading Color
                </Label>
                <Input id="color" value={customColor} onChange={handleCustomColorChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="background" className="text-right">
                  Background Color
                </Label>
                <Input
                  id="background"
                  value={customBackground}
                  onChange={handleCustomBackgroundChange}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-start pt-4">
          <Button onClick={handleSave} disabled={!isDirty}>
            Save Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
