"use client";

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
    saveSettings({
      ...settings,
      theme: {
        name: newTheme,
        customColor,
        customBackground,
      },
    });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    saveSettings({
      ...settings,
      theme: {
        name: selectedTheme,
        customColor: newColor,
        customBackground,
      },
    });
  };

  const handleCustomBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBackground = e.target.value;
    setCustomBackground(newBackground);
    saveSettings({
      ...settings,
      theme: {
        name: selectedTheme,
        customColor,
        customBackground: newBackground,
      },
    });
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
                <Input
                  id="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
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
                  onChange={handleCustomBackgroundChange}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
