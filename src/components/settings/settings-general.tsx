"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStorage } from "@/hooks/use-storage";
import { Input } from "../ui/input";

export function GeneralSettings() {
  const { isSmoothScrolling, toggleSmoothScrolling, isBlurEnabled, toggleBlurEffect } = useStorage();

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
          <Switch id="smoothScrolling" checked={isSmoothScrolling} onCheckedChange={toggleSmoothScrolling} />
        </div>
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="blurEffect">Enable blur effect</Label>
            <p className="text-sm text-muted-foreground">Whether the article page should have a blur on top and bottom</p>
          </div>
          <Switch id="blurEffect" checked={isBlurEnabled} onCheckedChange={toggleBlurEffect} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Your email" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
