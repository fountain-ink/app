"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AppControlsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Controls</CardTitle>
          <CardDescription>
            Manage core settings and functionalities of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">System Status</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the application in maintenance mode
                </p>
              </div>
              <Switch id="maintenance-mode" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="read-only">Read-Only Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Disable write operations
                </p>
              </div>
              <Switch id="read-only" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Features</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-user-registration">New User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register
                </p>
              </div>
              <Switch id="new-user-registration" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="blog-comments">Blog Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Enable commenting on blog posts
                </p>
              </div>
              <Switch id="blog-comments" defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Critical Actions</h3>
            <div className="flex flex-col space-y-2">
              <Button variant="destructive">Purge Cache</Button>
              <Button variant="outline">Reindex Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 