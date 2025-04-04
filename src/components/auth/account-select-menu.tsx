import { getLensClient } from "@/lib/lens/client";
import { Account, evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { Loader2, Plus, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { OnboardingModal } from "./onboarding-modal";
import { SelectAccountButton } from "./account-select-button";
import { syncBlogsQuietly } from "../blog/blog-sync-button";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { useOnboardingClient } from "@/hooks/use-lens-clients";

export function SelectAccountMenu({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<Account[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelect, setShowProfileSelect] = useState(true);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const setBlogs = useBlogStorage((state) => state.setBlogs);
  const onboardingClient = useOnboardingClient();

  const fetchProfiles = async () => {
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

      setProfiles(result.value.items.map((item: any) => item.account));
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [address]);

  const handleShowOnboarding = async () => {
    setIsOnboardingLoading(true);
    try {
      const client = await onboardingClient();
      if (!client) {
        throw new Error("Failed to get onboarding client");
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
    await fetchProfiles();

    console.log("Syncing blogs after successful onboarding");
    const blogs = await syncBlogsQuietly();
    if (blogs) {
      setBlogs(blogs);
    }
  };

  // Hide select menu when onboarding is open
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
            {profiles?.length === 0 && (
              <div className="text-center">
                <p className="mb-4">No profiles found</p>
              </div>
            )}

            {profiles?.length > 0 && (
              <ScrollArea className="w-full pr-4 max-h-[300px]">
                <div className="w-full flex flex-col gap-1">
                  {profiles.map((entry) => (
                    <SelectAccountButton key={entry.address} profile={entry} />
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="w-full flex justify-end gap-2">
              <Button
                className="w-full mt-4 gap-2"
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
