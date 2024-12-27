import { type Profile, useProfilesManaged } from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { LoginButton } from "./login-button";

export function ProfileSelectMenu({ onSuccess }: { onSuccess: (profile: Profile) => void }) {
  const { address } = useAccount();
  const {
    data: profiles,
    error,
    loading,
  } = useProfilesManaged({
    for: address || "",
    includeOwned: true,
  });

  if (loading) {
    return null;
  }

  if (error) {
    toast.error(error.message);
    return null;
  }

  return (
    <Dialog defaultOpen>
      <DialogTrigger className="p-2" asChild>
        <AnimatedMenuItem asButton icon={UserIcon} />
      </DialogTrigger>

      <DialogContent className="max-w-72">
        <DialogHeader>
          <DialogTitle>Select profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 items-center justify-center">
          {profiles.length === 0 && <p>No profiles found.</p>}
          {profiles.map((profile) => (
            <LoginButton key={profile.id} profile={profile} onSuccess={onSuccess} />
          ))}
          <Button
            variant="ghost"
            className="flex gap-2 w-full text-md"
            onClick={() => toast.error("Not implemented yet")}
          >
            <PlusIcon size={18} />
            New Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
