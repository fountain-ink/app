"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { useStorage } from "@/hooks/use-storage";
import { themeNames, type ThemeType } from "@/styles/themes";
import { useTheme } from "../theme/theme-context";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { isAutoSyncEnabled, toggleAutoSync, setTheme: setStoredTheme } = useStorage();

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Customize the appearance of your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Select Theme</Label>
          <Select onValueChange={handleThemeChange} value={theme}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select a theme" />
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
        <div className="flex items-center space-x-2">
          <Switch id="auto-theme" checked={isAutoSyncEnabled} onCheckedChange={toggleAutoSync} />
          <Label htmlFor="auto-theme">Automatically switch theme based on time</Label>
        </div>
      </CardContent>
    </Card>
  );
}
