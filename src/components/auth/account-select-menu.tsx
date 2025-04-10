import { getLensClient, getPublicClient } from "@/lib/lens/client";
import { Account, evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { Loader2, Plus, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { OnboardingModal } from "./onboarding-modal";
import { SelectAccountButton } from "./account-select-button";
import { syncBlogsQuietly } from "../blog/blog-sync-button";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { env } from "@/env";

export function SelectAccountMenu({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { address } = useAccount();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelect, setShowProfileSelect] = useState(true);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const setBlogs = useBlogStorage((state) => state.setBlogs);
  const { signMessageAsync } = useSignMessage();
  const { address: walletAddress } = useAccount();

  const fetchAccounts = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const client = await getLensClient();

      if (!client) {
        throw new Error("Failed to authenticate");
      }

      const result = await fetchAccountsAvailable(client, {
        managedBy: evmAddress(address),
        includeOwned: true,
      });

      if (result.isErr()) {
        throw result.error;
      }

      setAccounts(result.value.items.map((item: any) => item.account));
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [address]);

  const handleShowOnboarding = async () => {
    setIsOnboardingLoading(true);
    try {
      const client = await getPublicClient();
      if (!client) {
        throw new Error("Failed to get public client");
      }
      const sessionClient = await client.login({
        onboardingUser: {
          app: env.NEXT_PUBLIC_APP_ADDRESS,
          wallet: walletAddress,
        },
        signMessage: async (message: string) => {
          return await signMessageAsync({ message });
        },
      });

      if (sessionClient.isErr()) {
        throw new Error("Failed to get session client: " + sessionClient.error.message);
      }

      setShowProfileSelect(false);
      setShowOnboarding(true);
    } catch (err) {
      console.error("Error initializing onboarding:", err);
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  const handleOnboardingClose = (open: boolean) => {
    setShowOnboarding(open);
    if (!open) {
      setShowProfileSelect(true);
    }
  };

  const handleOnboardingSuccess = async () => {
    setShowOnboarding(false);
    handleOpenChange(false);

    console.log("Fetching accounts after successful onboarding");
    await fetchAccounts();

    console.log("Syncing blogs after successful onboarding");
    const blogs = await syncBlogsQuietly();
    if (blogs) {
      setBlogs(blogs);
    }
  };

  const handleSelectAccountSuccess = async () => {
    console.log("Syncing blogs after successful account selection");
    const blogs = await syncBlogsQuietly();
    if (blogs) {
      setBlogs(blogs);
    }
  };

  const isOpen = showOnboarding ? false : (open ?? showProfileSelect);
  const handleOpenChange = onOpenChange ?? setShowProfileSelect;

  if (loading) {
    return null;
  }

  if (error) {
    console.error("Failed to load profiles");
    return null;
  }

  if (!address) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger className="p-2" asChild>
          <AnimatedMenuItem asButton icon={UserIcon} />
        </DialogTrigger>

        <DialogContent className="max-w-96">
          <DialogHeader>
            <DialogTitle className="h-8 text-base flex items-center">Select profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-center justify-center">
            {accounts?.length === 0 && (
              <div className="text-center">
                <p className="mb-4">No profiles found</p>
              </div>
            )}

            {accounts?.length > 0 && (
              <ScrollArea className="w-full max-h-[350px]">
                <div className="w-full flex flex-col gap-2 pr-4">
                  {accounts.map((account) => (
                    <SelectAccountButton key={account.address} account={account} onSuccess={handleSelectAccountSuccess} />
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="w-full flex justify-end gap-2">
              <Button
                className="w-full gap-2"
                variant="default"
                onClick={handleShowOnboarding}
                disabled={isOnboardingLoading}
              >
                {isOnboardingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isOnboardingLoading ? "Signing in with Ethereum..." : "New Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OnboardingModal open={showOnboarding} onOpenChange={handleOnboardingClose} onSuccess={handleOnboardingSuccess} />
    </>
  );
}
