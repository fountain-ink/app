"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCookies } from "@/lib/clear-cookies";
import { SessionType, useLogout, useSession } from "@lens-protocol/react-web";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { ProfileSelectMenu } from "../auth/profile-select";
import { ConnectWalletButton } from "../auth/wallet-button";
import { LogoutIcon } from "../icons/logout";
import { SettingsGearIcon } from "../icons/settings";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { AvatarSuspense, SessionAvatar } from "./user-avatar";

export const UserMenu = () => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { execute: logout, loading: logoutLoading } = useLogout();

  if (loading) return <AvatarSuspense />;

  if (error) {
    toast.error(error.message);
    return null;
  }

  if (!isWalletConnected) {
    return <ConnectWalletButton />;
  }

  if (session.type !== SessionType.WithProfile) {
    return <ProfileSelectMenu onSuccess={() => {}} />;
  }

  const handle = session.profile?.handle?.localName;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <SessionAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="p-1 flex flex-col gap-1 w-48">
          <AnimatedMenuItem href={`/${handle}`} icon={UserIcon}>
            Profile
          </AnimatedMenuItem>

          <AnimatedMenuItem
            icon={UserRoundPenIcon}
            onClick={() => {
              logout();
              clearCookies();
            }}
          >
            Switch Profile
          </AnimatedMenuItem>

          <AnimatedMenuItem href="/settings" icon={SettingsGearIcon}>
            Settings
          </AnimatedMenuItem>

          <AnimatedMenuItem
            icon={LogoutIcon}
            onClick={() => {
              disconnect();
              logout();
              clearCookies();
            }}
          >
            Disconnect
          </AnimatedMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
