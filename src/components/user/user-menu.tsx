"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCookies } from "@/lib/clear-cookies";
import { SessionType, useLogout, useSession } from "@lens-protocol/react-web";
import Link from "next/link";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { ProfileSelectMenu } from "../auth/profile-select";
import { ConnectWalletButton } from "../auth/wallet-button";
import { LogoutIcon } from "../icons/logout";
import { SettingsGearIcon } from "../icons/settings";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
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
      <DropdownMenuContent align="end" className="w-48 mt-1">
        <Link href={`/${handle}`} passHref>
          <DropdownMenuItem className="flex justify-start gap-2 items-center text-base group px-0 h-10">
            <UserIcon />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() => {
            logout();
            clearCookies();
          }}
          disabled={logoutLoading}
          className="flex justify-start gap-2 items-center text-base group px-0 h-10"
        >
          <UserRoundPenIcon />
          <span>Switch Profile</span>
        </DropdownMenuItem>
        <Link href="/settings" passHref>
          <DropdownMenuItem className="flex justify-start gap-2 items-center text-base group px-0 h-10">
            <SettingsGearIcon />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={() => {
            disconnect();
            logout();
            clearCookies();
          }}
          className="flex justify-start gap-2 items-center text-base group px-0 h-10"
        >
          <LogoutIcon />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
