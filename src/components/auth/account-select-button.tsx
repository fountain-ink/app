"use client";

import { useAccountOwnerClient } from "@/hooks/use-lens-clients";
import { Account } from "@lens-protocol/client";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/user-avatar";
import { setupUserAuth } from "./auth-manager";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { syncBlogsQuietly } from "../blog/blog-sync-button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SelectAccountButton({ profile, onSuccess }: { profile: Account; onSuccess?: () => Promise<void> }) {
  const { address } = useAccount();
  const accountOwnerAuth = useAccountOwnerClient();
  const router = useRouter();
  const resetBlogStorage = useBlogStorage((state) => state.resetState);
  const setBlogs = useBlogStorage((state) => state.setBlogs);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!address) {
    return null;
  }

  const login = async () => {
    setIsLoggingIn(true);
    try {
      const client = await accountOwnerAuth(profile.address);

      if (!client) {
        throw new Error("Failed to authenticate with the account");
      }

      const credentials = await client.getCredentials();

      if (credentials.isErr()) {
        console.error("Failed to get credentials", credentials.error);
        throw new Error("Unable to retrieve authentication credentials");
      }

      const refreshToken = credentials.value?.refreshToken;

      if (!refreshToken) {
        console.error("Failed to get refresh token - missing from credentials");
        throw new Error("Authentication token unavailable");
      }

      try {
        await setupUserAuth(refreshToken);
      } catch (error) {
        console.error("Error setting up user auth:", error);
        throw new Error("Couldn't complete login process");
      }

      toast.success("Logged in successfully!");
      console.log("Logged in successfully!");

      resetBlogStorage();
      await onSuccess?.();

      router.push(`/u/${profile.username?.localName}`);
      window.location.reload();
    } catch (err) {
      console.error("Error logging in:", err);
      toast.error(err instanceof Error ? err.message : "Failed to log in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-between gap-2 text-md w-full"
      onClick={login}
      disabled={isLoggingIn}
    >
      <div className="flex items-center gap-2">
        <UserAvatar account={profile} className="w-8 h-8" />
        {profile.username?.localName ?? profile.address}
      </div>
      {isLoggingIn && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}
