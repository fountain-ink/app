"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAllCookies } from "@/lib/auth/clear-cookies";
import { MeResult } from "@lens-protocol/client";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletButton } from "../auth/auth-wallet-button";
import { ProfileSelectMenu } from "../auth/profile-select-menu";
import { LogoutIcon } from "../icons/logout";
import { MoonIcon } from "../icons/moon";
import { PenToolIcon } from "../icons/pen-tool";
import { SettingsGearIcon } from "../icons/settings";
import { SquarePenIcon } from "../icons/square-pen";
import { SunIcon } from "../icons/sun";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
import { UserAvatar } from "./user-avatar";
import { AnimatedMenuItem } from "../navigation/animated-item";

export const UserMenu = ({ session }: { session: MeResult | null }) => {
  const { isConnected: isWalletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleLogout = async () => {
    clearAllCookies();
    router.refresh();
  };

  const handleDisconnect = async () => {
    disconnect();
    clearAllCookies();
    router.refresh();
  };

  if (!isWalletConnected) {
    return <ConnectWalletButton />;
  }

  if (!session) {
    return <ProfileSelectMenu />;
  }

  const username = session.loggedInAs.account.username?.localName;

  // Get the settings path based on current route
  const getSettingsPath = () => {
    if (pathname.match(/^\/u\/[^/]+$/)) return "/settings/profile";
    if (pathname.match(/^\/b\/[^/]+$/)) return "/settings/blog";
    return "/settings";
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
          <UserAvatar account={session.loggedInAs.account} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-48">
          <AnimatedMenuItem href={`/b/${username}`} icon={PenToolIcon}>
            Blog
          </AnimatedMenuItem>

          <AnimatedMenuItem href={`/u/${username}`} icon={UserIcon}>
            Profile
          </AnimatedMenuItem>

          <AnimatedMenuItem icon={UserRoundPenIcon} onClick={handleLogout}>
            Switch Profile
          </AnimatedMenuItem>

          <AnimatedMenuItem href={`/u/${username}/drafts`} icon={SquarePenIcon}>
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

          <AnimatedMenuItem icon={LogoutIcon} onClick={handleDisconnect}>
            Disconnect
          </AnimatedMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
