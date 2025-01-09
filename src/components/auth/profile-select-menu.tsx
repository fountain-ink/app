import { getLensClient } from "@/lib/lens/client";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export function ProfileSelectMenu() {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<any>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchProfiles() {
        if (!address) return;

        const client = await getLensClient();

        try {
          setLoading(true);
          const result = await fetchAccountsAvailable(client, {
            managedBy: evmAddress(address),
            includeOwned: true,
          })

          if (result.isErr()) {
            throw result.error;
          }

          setProfiles(result._unsafeUnwrap()?.items)
          console.log(result._unsafeUnwrap()?.items)
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      }

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
    <Dialog defaultOpen>
      <DialogTrigger className="p-2" asChild>
        <AnimatedMenuItem
          asButton
          icon={UserIcon}
        />
      </DialogTrigger>

      <DialogContent className="max-w-72">
        <DialogHeader>
          <DialogTitle>Select profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 items-center justify-center">
          {profiles?.length === 0 && <p>No profiles found</p>}
          {/* {!session && (
            <p className="text-center text-sm text-muted-foreground">
              Please connect your wallet first
            </p>
          )}
          {session && profiles?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No profiles found
            </p>
          )}
          {session && profiles?.map((profile) => (
            <LoginButton
              key={profile.id}
              profile={profile}
              onSuccess={onSuccess}
              isActive={activeProfile?.id === profile.id}
            />
          ))}
          {session && (
            <Button
              variant="ghost"
              className="flex gap-2 w-full text-md"
              onClick={() => toast.error("Profile creation coming soon")}
            >
              <PlusIcon size={18} />
              New Profile
            </Button>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
