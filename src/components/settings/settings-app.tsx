"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEmail } from "@/hooks/use-email";
import { useSettings } from "@/hooks/use-settings";
import { UserSettings } from "@/lib/settings/user-settings";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { getLensClient } from "@/lib/lens/client";
import { enableSignless, fetchMeDetails, removeSignless } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import { toast } from "sonner";

interface ApplicationSettingsProps {
  initialSettings?: UserSettings;
  initialEmail?: string;
}

export function ApplicationSettings({ initialSettings = {}, initialEmail }: ApplicationSettingsProps) {
  const { settings, saveSettings } = useSettings(initialSettings);
  const { email: initialEmailFromHook, saveEmail } = useEmail(initialEmail);
  const [isSmoothScrolling, setIsSmoothScrolling] = useState(settings.app?.isSmoothScrolling ?? false);
  const [isBlurEnabled, setIsBlurEnabled] = useState(settings.app?.isBlurEnabled ?? false);
  const [email, setEmail] = useState(initialEmailFromHook ?? "");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSignless, setIsSignless] = useState(false);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const fetchSignlessStatus = async () => {
      const client = await getLensClient();
      if (client.isSessionClient()) {
        const result = await fetchMeDetails(client);
        if (result.isOk()) {
          setIsSignless(result.value.isSignless);
        }
      }
    };
    fetchSignlessStatus();
  }, []);

  const handleSignlessChange = async (checked: boolean) => {
    const client = await getLensClient();
    if (!client.isSessionClient() || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const signlessToast = toast.loading(checked ? "Enabling signless mode..." : "Disabling signless mode...");
      const signlessResult = checked
        ? await enableSignless(client)
            .andThen((tx) => handleOperationWith(walletClient as any)(tx))
            .andThen(client.waitForTransaction)
        : await removeSignless(client)
            .andThen((tx) => handleOperationWith(walletClient as any)(tx))
            .andThen(client.waitForTransaction);

      if (signlessResult.isErr()) {
        toast.dismiss(signlessToast);
        console.error("Failed to update signless mode:", signlessResult.error);
        toast.error("Failed to update signless mode");
        setIsSignless(!checked);
        return;
      }

      toast.dismiss(signlessToast);
      toast.success(checked ? "Signless mode enabled" : "Signless mode disabled");
      setIsSignless(checked);
    } catch (error) {
      console.error("Error updating signless mode:", error);
      toast.error("Failed to update signless mode");
      setIsSignless(!checked);
    }
  };

  useEffect(() => {
    setIsSmoothScrolling(settings.app?.isSmoothScrolling ?? false);
    setIsBlurEnabled(settings.app?.isBlurEnabled ?? false);
    setEmail(initialEmailFromHook ?? "");
    setIsDirty(false);
  }, [settings, initialEmailFromHook]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === "" || emailRegex.test(email);
  };

  const handleSmoothScrollingChange = (checked: boolean) => {
    setIsSmoothScrolling(checked);
    setIsDirty(true);
  };

  const handleBlurEffectChange = (checked: boolean) => {
    setIsBlurEnabled(checked);
    setIsDirty(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isEmailValid) return;

    const settingsSuccess = await saveSettings({
      app: {
        isSmoothScrolling,
        isBlurEnabled,
      },
    });

    const emailSuccess = await saveEmail(email);

    if (settingsSuccess && emailSuccess) {
      setIsDirty(false);
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
            <Label htmlFor="signless">Enable signless experience</Label>
            <p className="text-sm text-muted-foreground">
              Adds an account manager to enable a signature-free experience
            </p>
          </div>
          <Switch id="signless" checked={isSignless} onCheckedChange={handleSignlessChange} />
        </div>
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
            className={!isEmailValid ? "border-destructive" : ""}
          />
          {!isEmailValid && <p className="text-sm text-destructive">Please enter a valid email address</p>}
        </div>

        <div className="flex justify-start pt-4">
          <Button onClick={handleSave} disabled={!isDirty || !isEmailValid}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
