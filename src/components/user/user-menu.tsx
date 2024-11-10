"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <SessionAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
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
    </DropdownMenu>
  );
};
