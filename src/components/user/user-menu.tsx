"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCookies } from "@/lib/auth/clear-cookies";
import { SessionType, useLogout, useSession } from "@lens-protocol/react-web";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletButton } from "../auth/auth-wallet-button";
import { ProfileSelectMenu } from "../auth/profile-select-menu";
import { SunIcon } from "../icons/icon";
import { LogoutIcon } from "../icons/logout";
import { PenToolIcon } from "../icons/pen-tool";
import { SettingsGearIcon } from "../icons/settings";
import { SquarePenIcon } from "../icons/square-pen";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { AvatarSuspense, SessionAvatar } from "./user-avatar";
import { MoonIcon } from "../icons/moon";

export const UserMenu = () => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { execute: logout, loading: logoutLoading } = useLogout();
  const _pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

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
        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
          <SessionAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-48">
          <AnimatedMenuItem href={`/u/${handle}`} icon={PenToolIcon}>
            Index
          </AnimatedMenuItem>

          <AnimatedMenuItem href={`/u/${handle}/profile`} icon={UserIcon}>
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

          <AnimatedMenuItem href={`/u/${handle}/drafts`} icon={SquarePenIcon}>
            Drafts
          </AnimatedMenuItem>

          <AnimatedMenuItem href="/settings" icon={SettingsGearIcon}>
            Settings
          </AnimatedMenuItem>

          {isDarkMode ? (
            <AnimatedMenuItem
              onClick={() => {
                setTheme("light");
              }}
              icon={SunIcon}
            >
              Light Mode
            </AnimatedMenuItem>
          ) : (
            <AnimatedMenuItem
              onClick={() => {
                setTheme("dark");
              }}
              icon={MoonIcon}
            >
              Dark Mode
            </AnimatedMenuItem>
          )}

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
