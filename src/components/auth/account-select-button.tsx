"use client";

import { Account } from "@lens-protocol/client";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/user-avatar";
import { setupUserAuth } from "./auth-manager";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { syncBlogsQuietly } from "../blog/blog-sync-button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getPublicClient } from "@/lib/lens/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import { env } from "@/env";
import { useUIStore } from "@/stores/ui-store";

export function SelectAccountButton({ account, onSuccess }: { account: Account; onSuccess?: () => Promise<void> }) {
  const { address: walletAddress } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const resetBlogStorage = useBlogStorage((state) => state.resetState);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signMessageAsync, error, isError, isPending, variables } = useSignMessage();
  const isLandingPage = pathname === "/";
  const setProfileSelectModalOpen = useUIStore((state) => state.setProfileSelectModalOpen);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message);
      console.error(error);
    }
  }, [isError, error]);

  const login = async () => {
    setIsLoggingIn(true);
    try {
      const client = await getPublicClient();

      if (!client) {
        throw new Error("No Lens client found");
      }

      if (!walletAddress) {
        throw new Error("No wallet address found");
      }

      const isOwner = account.owner === walletAddress;
      const ownerRequest = {
        accountOwner: {
          account: account.address,
          owner: walletAddress,
          app:
            env.NEXT_PUBLIC_ENVIRONMENT === "development"
              ? env.NEXT_PUBLIC_APP_ADDRESS_TESTNET
              : env.NEXT_PUBLIC_APP_ADDRESS,
        },
      };
      const managerRequest = {
        accountManager: {
          account: account.address,
          manager: walletAddress,
          app:
            env.NEXT_PUBLIC_ENVIRONMENT === "development"
              ? env.NEXT_PUBLIC_APP_ADDRESS_TESTNET
              : env.NEXT_PUBLIC_APP_ADDRESS,
        },
      };
      const challengeRequest = isOwner ? ownerRequest : managerRequest;

      const authenticated = await client.login({
        ...challengeRequest,
        signMessage: async (message: string) => {
          return await signMessageAsync({ message });
        },
      });

      if (authenticated.isErr()) {
        throw new Error(`Failed to get authenticated client: ${authenticated.error.message}`);
      }

      const credentials = await authenticated.value.getCredentials();

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

      if (isLandingPage) {
        router.push(`/u/${account.username?.localName}`);
      }
      setProfileSelectModalOpen(false);

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
      <div className="flex items-center truncate overflow-hidden text-ellipsis max-w-[260px] gap-2">
        <UserAvatar account={account} className="w-8 h-8 flex-shrink-0" />
        <div className="truncate overflow-hidden text-ellipsis max-w-[260px]">
          {account.username?.localName ?? account.address}
        </div>
      </div>
      {isLoggingIn && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}
