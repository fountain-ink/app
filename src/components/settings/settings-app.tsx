"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface ApplicationSettingsProps {
  initialSettings?: any;
}

export function ApplicationSettings({ initialSettings = {} }: ApplicationSettingsProps) {
  const { settings, saveSettings, isSaving } = useSettings(initialSettings);
  const [isSmoothScrolling, setIsSmoothScrolling] = useState(settings.app?.isSmoothScrolling ?? false);
  const [isBlurEnabled, setIsBlurEnabled] = useState(settings.app?.isBlurEnabled ?? false);

  useEffect(() => {
    setIsSmoothScrolling(settings.app?.isSmoothScrolling ?? false);
    setIsBlurEnabled(settings.app?.isBlurEnabled ?? false);
  }, [settings]);

  const handleSmoothScrollingChange = async (checked: boolean) => {
    setIsSmoothScrolling(checked);
    await saveSettings({
      ...settings,
      app: {
        ...settings.app,
        isSmoothScrolling: checked,
      },
    });
  };

  const handleBlurEffectChange = async (checked: boolean) => {
    setIsBlurEnabled(checked);
    await saveSettings({
      ...settings,
      app: {
        ...settings.app,
        isBlurEnabled: checked,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Manage your application settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="smoothScrolling">Enable smooth scrolling</Label>
            <p className="text-sm text-muted-foreground">Whether the article page should scroll smoothly</p>
          </div>
          <Switch
            id="smoothScrolling"
            checked={isSmoothScrolling}
            onCheckedChange={handleSmoothScrollingChange}
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="blurEffect">Enable blur effect</Label>
            <p className="text-sm text-muted-foreground">
              Whether the article page should have a blur on top and bottom
            </p>
          </div>
          <Switch
            id="blurEffect"
            checked={isBlurEnabled}
            onCheckedChange={handleBlurEffectChange}
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Your email" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
