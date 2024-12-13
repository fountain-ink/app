"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCookies } from "@/lib/auth/clear-cookies";
import { FeedbackFish } from "@feedback-fish/react";
import { SessionType, useLogout, useSession } from "@lens-protocol/react-web";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletButton } from "../auth/auth-wallet-button";
import { ProfileSelectMenu } from "../auth/profile-select-menu";
import { LogoutIcon } from "../icons/logout";
import { MessageCircleMoreIcon } from "../icons/message-more";
import { PenToolIcon } from "../icons/pen-tool";
import { SettingsGearIcon } from "../icons/settings";
import { SquarePenIcon } from "../icons/square-pen";
import { UserRoundPenIcon } from "../icons/switch-profile";
import { UserIcon } from "../icons/user";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { AvatarSuspense, SessionAvatar } from "./user-avatar";

export const UserMenu = () => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { execute: logout, loading: logoutLoading } = useLogout();
  const pathname = usePathname();

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

          <FeedbackFish projectId="48aad16d4c95d5" userId={session.profile.handle?.localName}>
            <Button className="w-full p-0 m-0" variant="ghost">
              <AnimatedMenuItem icon={MessageCircleMoreIcon}>Feedback</AnimatedMenuItem>
            </Button>
          </FeedbackFish>

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
