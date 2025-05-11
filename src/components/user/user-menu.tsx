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
import { LogoutIcon } from "../icons/logout";
import { MoonIcon } from "../icons/moon";
import { SettingsGearIcon } from "../icons/settings";
import { SquarePenIcon } from "../icons/square-pen";
import { SunIcon } from "../icons/sun";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
import { UserAvatar } from "./user-avatar";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { getLensClient } from "@/lib/lens/client";
import { useEffect } from "react";
import { BlogDropdownMenu } from "../blog/blog-dropdown-menu";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { HomeIcon } from "../icons/home";
import { useUIStore } from "@/stores/ui-store";

export const UserMenu = ({ session }: { session: MeResult | null }) => {
  const { isConnected: isWalletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme: theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const resetBlogStorage = useBlogStorage((state) => state.resetState);
  const setProfileSelectModalOpen = useUIStore((state) => state.setProfileSelectModalOpen);

  useEffect(() => {
    if (isWalletConnected && !session) {
      setProfileSelectModalOpen(true);
    }
  }, [isWalletConnected, session, setProfileSelectModalOpen]);

  const handleDisconnect = async () => {
    const client = await getLensClient();
    if (client.isSessionClient()) {
      await client.logout();
    }
    disconnect();
    clearAllCookies();
    resetBlogStorage();
    router.push("/");
    window.location.reload();
  };

  if (!isWalletConnected) {
    return <ConnectWalletButton text="Login" />;
  }

  if (!session) {
    // Render a minimal menu or a loading state if desired,
    // or rely on the global modal being the primary focus.
    // For now, let it fall through to render the UserAvatar, which will show a generic icon.
    // The dropdown will be mostly empty/disabled until a session is active.
  }

  const username = session?.loggedInAs.account.username?.localName;

  const getSettingsPath = () => {
    if (pathname.match(/^\/u\/[^/]+$/)) return "/settings/profile";
    if (pathname.match(/^\/b\/[^/]+$/)) return "/settings/blogs";
    return "/settings";
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full shrink-0">
          <UserAvatar account={session?.loggedInAs.account} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-48">
          {session && (
            <>
              <AnimatedMenuItem href="/featured" icon={HomeIcon}>
                Home
              </AnimatedMenuItem>

              {username && <BlogDropdownMenu username={username} />}

              <AnimatedMenuItem href={`/u/${username}`} icon={UserIcon}>
                Profile
              </AnimatedMenuItem>
            </>
          )}

          <AnimatedMenuItem
            icon={UserRoundPenIcon}
            onClick={() => {
              setProfileSelectModalOpen(true);
            }}
          >
            Switch Profile
          </AnimatedMenuItem>

          {session && (
            <>
              <AnimatedMenuItem href={`/u/${username}/drafts`} icon={SquarePenIcon}>
                Drafts
              </AnimatedMenuItem>

              <AnimatedMenuItem href={getSettingsPath()} icon={SettingsGearIcon}>
                Settings
              </AnimatedMenuItem>
            </>
          )}

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
