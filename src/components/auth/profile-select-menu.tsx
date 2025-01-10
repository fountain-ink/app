import { getLensClient } from "@/lib/lens/client";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { OnboardingModal } from "./onboarding-modal";

export function ProfileSelectMenu() {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<any>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  if (loading) {
    return null;
  }

  if (error) {
    toast.error("Failed to load profiles");
    return null;
  }

  if (!address) {
    return null;
  }

  return (
    <>
      <Dialog>
        <DialogTrigger className="p-2" asChild>
          <AnimatedMenuItem asButton icon={UserIcon} />
        </DialogTrigger>

        <DialogContent className="max-w-72">
          <DialogHeader>
            <DialogTitle>Select profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 items-center justify-center">
            {profiles?.length === 0 && (
              <div className="text-center">
                <p className="mb-4">No profiles found</p>
                <Button onClick={() => setShowOnboarding(true)}>
                  Create Profile
                </Button>
              </div>
            )}

            {profiles?.length > 0 && (
              <div className="w-full">
                {profiles.map((profile: any) => (
                  <Button
                    key={profile.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {/* Handle profile selection */}}
                  >
                    {profile.username || 'Unnamed Profile'}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <OnboardingModal 
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onSuccess={fetchProfiles}
      />
    </>
  );
}
