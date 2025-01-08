"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface ApplicationSettingsProps {
  initialSettings?: any;
  initialEmail?: string | null;
}

export function ApplicationSettings({ initialSettings = {}, initialEmail }: ApplicationSettingsProps) {
  const { settings, email: initialEmailFromHook, saveSettings } = useSettings(initialSettings, initialEmail);
  const [isSmoothScrolling, setIsSmoothScrolling] = useState(settings.app?.isSmoothScrolling ?? false);
  const [isBlurEnabled, setIsBlurEnabled] = useState(settings.app?.isBlurEnabled ?? false);
  const [email, setEmail] = useState(initialEmailFromHook ?? "");
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    setIsSmoothScrolling(settings.app?.isSmoothScrolling ?? false);
    setIsBlurEnabled(settings.app?.isBlurEnabled ?? false);
    setEmail(initialEmailFromHook ?? "");
  }, [settings, initialEmailFromHook]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === "" || emailRegex.test(email);
  };

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

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
    await saveSettings(settings, email);
  };

  const handleEmailBlur = async () => {
    if (isEmailValid && email !== initialEmailFromHook) {
      await saveSettings(settings, email);
    }
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
          <Switch id="smoothScrolling" checked={isSmoothScrolling} onCheckedChange={handleSmoothScrollingChange} />
        </div>
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="blurEffect">Enable blur effect</Label>
            <p className="text-sm text-muted-foreground">
              Whether the article page should have a blur on top and bottom
            </p>
          </div>
          <Switch id="blurEffect" checked={isBlurEnabled} onCheckedChange={handleBlurEffectChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Your email" 
            value={email} 
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={!isEmailValid ? "border-destructive" : ""}
          />
          {!isEmailValid && (
            <p className="text-sm text-destructive">Please enter a valid email address</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
