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
import { Wallet } from "lucide-react";
import { useReconnectWallet } from "@/hooks/use-reconnect-wallet";
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

export const UserMenu = ({ session, showDropdown = false }: { session: MeResult | null; showDropdown?: boolean }) => {
  const { isConnected: isWalletConnected, status } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme: theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const resetBlogStorage = useBlogStorage((state) => state.resetState);
  const setProfileSelectModalOpen = useUIStore((state) => state.setProfileSelectModalOpen);

  useEffect(() => {
    if (isWalletConnected && !session && showDropdown) {
      setProfileSelectModalOpen(true);
    }
  }, [isWalletConnected, session, setProfileSelectModalOpen, showDropdown]);

  const handleDisconnect = async () => {
    const client = await getLensClient();

    disconnectWallet();
    clearAllCookies();
    resetBlogStorage();

    if (client.isSessionClient()) {
      await client.logout();
      router.push("/");
      window.location.reload();
    }
  };

  const reconnectWallet = useReconnectWallet();

  if (!session && !isWalletConnected && status !== "connecting") {
    return <ConnectWalletButton text="Login" />;
  }

  const username = session?.loggedInAs.account.username?.localName;

  const getSettingsPath = () => {
    if (pathname.match(/^\/u\/[^/]+$/)) return "/settings/profile";
    if (pathname.match(/^\/b\/[^/]+$/)) return "/settings/blogs";
    return "/settings";
  };

  if (!showDropdown) {
    return (
      <Button variant="default" className="shrink-0" onClick={() => setProfileSelectModalOpen(true)}>
        Login
      </Button>
    );
  }

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
            {session ? "Switch Profile" : "Select Profile"}
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

          {!isWalletConnected && (
            <AnimatedMenuItem icon={Wallet} onClick={reconnectWallet}>
              Reconnect Wallet
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
