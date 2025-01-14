"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAllCookies, clearAuthCookies } from "@/lib/auth/clear-cookies";
import { MeResult } from "@lens-protocol/client";
import { useLogout } from "@lens-protocol/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletButton } from "../auth/auth-wallet-button";
import { ProfileSelectMenu } from "../auth/profile-select-menu";
import { SunIcon } from "../icons/icon";
import { LogoutIcon } from "../icons/logout";
import { MoonIcon } from "../icons/moon";
import { PenToolIcon } from "../icons/pen-tool";
import { SettingsGearIcon } from "../icons/settings";
import { SquarePenIcon } from "../icons/square-pen";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { SessionAvatar } from "./user-avatar";

export const UserMenu = ({ session }: { session: MeResult | null }) => {
  const { isConnected: isWalletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { execute: logout, loading: logoutLoading } = useLogout();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  if (!isWalletConnected) {
    return <ConnectWalletButton />;
  }

  if (!session) {
    return <ProfileSelectMenu />;
  }

  const handle = session.loggedInAs.account.username?.localName;

  // Get the settings path based on current route
  const getSettingsPath = () => {
    if (pathname.match(/^\/u\/[^/]+\/profile$/)) return "/settings/profile";
    if (pathname.match(/^\/u\/[^/]+$/)) return "/settings/blog";
    return "/settings";
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
          <SessionAvatar account={session.loggedInAs.account} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-48">
          <AnimatedMenuItem href={`/b/${handle}`} icon={PenToolIcon}>
            Blog
          </AnimatedMenuItem>

          <AnimatedMenuItem href={`/u/${handle}`} icon={UserIcon}>
            Profile
          </AnimatedMenuItem>

          <AnimatedMenuItem
            icon={UserRoundPenIcon}
            onClick={async () => {
              await logout();
              clearAuthCookies();
              router.refresh();
            }}
          >
            Switch Profile
          </AnimatedMenuItem>

          <AnimatedMenuItem href={`/u/${handle}/drafts`} icon={SquarePenIcon}>
            Drafts
          </AnimatedMenuItem>

          <AnimatedMenuItem href={getSettingsPath()} icon={SettingsGearIcon}>
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

            onClick={async () => {
              disconnect();
              await logout();
              clearAllCookies();
              router.refresh();
            }}
          >
            Disconnect
          </AnimatedMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
