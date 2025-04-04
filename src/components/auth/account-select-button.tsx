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

export function SelectAccountButton({ profile, onSuccess }: { profile: Account; onSuccess?: () => void }) {
  const { address } = useAccount();
  const accountOwnerAuth = useAccountOwnerClient();
  const router = useRouter();
  const resetBlogStorage = useBlogStorage((state) => state.resetState);
  const setBlogs = useBlogStorage((state) => state.setBlogs);

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
        console.error("Failed to get credentials");
        throw new Error("Failed to get credentials");
      }

      const refreshToken = credentials.value?.refreshToken;

      if (!refreshToken) {
        console.error("Failed to get refresh token");
        throw new Error("Failed to get refresh token");
      }

      try {
        await setupUserAuth(refreshToken);
      } catch (error) {
        console.error("Error setting up user auth:", error);
        return;
      }

      // redirect to /u/username
      router.push(`/u/${profile.username?.localName}`);

      toast.success("Logged in successfully!");
      console.log("Logged in successfully!");
      resetBlogStorage();

      // Sync blogs after successful login
      const blogs = await syncBlogsQuietly();
      if (blogs) {
        setBlogs(blogs);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <Button variant="ghost" className="flex items-center justify-start gap-2 text-md w-full" onClick={login}>
      <UserAvatar account={profile} className="w-8 h-8" />
      {profile.username?.localName ?? profile.address}
    </Button>
  );
}
