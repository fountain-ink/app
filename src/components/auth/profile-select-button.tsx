"use client";

import { useAccountOwnerClient } from "@/hooks/use-lens-clients";
import { Account } from "@lens-protocol/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/user-avatar";
import { setupUserAuth } from "./auth-manager";
import { useBlogStorage } from "@/hooks/use-blog-storage";

export function ProfileSelectButotn({ profile, onSuccess }: { profile: Account; onSuccess?: () => void }) {
  const { address } = useAccount();
  const accountOwnerAuth = useAccountOwnerClient();
  const router = useRouter();
  const resetBlogStorage = useBlogStorage((state) => state.resetState);

  if (!address) {
    return null;
  }

  const login = async () => {
    try {
      const client = await accountOwnerAuth(profile.address);

      if (!client) {
        throw new Error("Failed to authenticate");
      }

      const credentials = await client.getCredentials();

      if (credentials.isErr()) {
        toast.error("Failed to get credentials");
        throw new Error("Failed to get credentials");
      }

      const refreshToken = credentials.value?.refreshToken;

      if (!refreshToken) {
        toast.error("Failed to get refresh token");
        throw new Error("Failed to get refresh token");
      }

      try {
        await setupUserAuth(refreshToken);
      } catch (error) {
        console.error("Error setting up user auth:", error);
        return toast.error("Failed to complete authentication");
      }

      // Reset blog storage when switching profiles
      resetBlogStorage();
      
      toast.success("Successfully logged in");

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Error logging in:", err);
      toast.error("Failed to login");
    }
  };

  return (
    <Button variant="ghost" className="flex items-center justify-start gap-2 text-md w-full" onClick={login}>
      <UserAvatar account={profile} className="w-8 h-8" />
      {profile.username?.localName ?? profile.address}
    </Button>
  );
}
