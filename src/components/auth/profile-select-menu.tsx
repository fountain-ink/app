import { getLensClient } from "@/lib/lens/client";
import { Account, evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { Plus, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { OnboardingModal } from "./onboarding-modal";
import { ProfileSelectButotn } from "./profile-select-button";

export function ProfileSelectMenu({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<Account[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSelect, setShowProfileSelect] = useState(true);

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

  const handleShowOnboarding = () => {
    setShowProfileSelect(false);
    setShowOnboarding(true);
  };

  const handleOnboardingClose = (open: boolean) => {
    setShowOnboarding(open);
    if (!open) {
      setShowProfileSelect(true);
    }
  };

  const isOpen = open ?? showProfileSelect;
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
            <DialogTitle>Select profile</DialogTitle>
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
                    <ProfileSelectButotn key={entry.address} profile={entry} />
                  ))}
                </div>
              </ScrollArea>
            )}

            <Button className="flex gap-2" variant="default" onClick={handleShowOnboarding}>
              <Plus className="w-4 h-4" />
              New Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OnboardingModal open={showOnboarding} onOpenChange={handleOnboardingClose} onSuccess={fetchProfiles} />
    </>
  );
}
