import { useAccountOwnerClient } from "@/hooks/use-lens-clients";
import { getLensClient } from "@/lib/lens/client";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { LoginButton } from "./login-button";
import { OnboardingModal } from "./onboarding-modal";

export function ProfileSelectMenu() {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<any>([]);
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

      setProfiles(result._unsafeUnwrap()?.items);
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
    // Hide profile select when showing onboarding
    setShowProfileSelect(false); 
    setShowOnboarding(true);
  };

  const handleOnboardingClose = (open: boolean) => {
    setShowOnboarding(open);
    if (!open) {
      // Show profile select when closing onboarding
      setShowProfileSelect(true); 
    }
  };

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
      <Dialog open={showProfileSelect} onOpenChange={setShowProfileSelect}>
        <DialogTrigger className="p-2" asChild>
          <AnimatedMenuItem asButton icon={UserIcon} />
        </DialogTrigger>

        <DialogContent className="max-w-96">
          <DialogHeader>
            <DialogTitle>Select profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 items-center justify-center">
            {profiles?.length === 0 && (
              <div className="text-center">
                <p className="mb-4">No profiles found</p>
              </div>
            )}

            {profiles?.length > 0 && (
              <ScrollArea className="w-full pr-4 max-h-[300px]">
                <div className="w-full flex flex-col gap-1">
                  {profiles.map((entry: any) => (
                    <LoginButton key={entry.id} profile={entry.account} />
                  ))}
                </div>
              </ScrollArea>
            )}

            <Button className="flex gap-2" variant="outline" onClick={handleShowOnboarding}>
              <PlusIcon size={16} />
              New Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OnboardingModal open={showOnboarding} onOpenChange={handleOnboardingClose} onSuccess={fetchProfiles} />
    </>
  );
}
