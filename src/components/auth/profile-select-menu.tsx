import { useAccountOwnerClient } from "@/hooks/use-lens-clients";
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
import { setupUserAuth } from "./auth-manager";
import { OnboardingModal } from "./onboarding-modal";

export function ProfileSelectMenu() {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<any>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const accountOwnerAuth = useAccountOwnerClient();

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

  const handleSelectProfile = async (profile: any) => {
    console.log("Selected profile:", profile);

    try {
      const client = await accountOwnerAuth(profile.account.address);

      if (!client) {
        throw new Error("Failed to authenticate");
      }

      console.log("Client:", client);

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

      toast.success("Successfully logged in");
      window.location.reload(); // Refresh to update the auth state
    } catch (err) {
      console.error("Error switching profile:", err);
      toast.error("Failed to switch profile");
    }
  };

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
              </div>
            )}

            {profiles?.length > 0 && (
              <div className="w-full">
                {profiles.map((entry: any) => {
                  return (
                    <Button
                      key={entry.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleSelectProfile(entry)}
                    >
                      {entry.account.username.localName}
                    </Button>
                  );
                })}
              </div>
            )}

            <Button variant="outline" onClick={() => setShowOnboarding(true)}>
              New Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} onSuccess={fetchProfiles} />
    </>
  );
}
