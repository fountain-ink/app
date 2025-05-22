"use client";

import type { Account, AccountStats } from "@lens-protocol/client";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserName } from "@/components/user/user-name";
import { UserFollowing } from "@/components/user/user-following";
import { UserFollowButton } from "@/components/user/user-follow";
import { UserBio } from "@/components/user/user-bio";
import { Button } from "@/components/ui/button";
import { ProfileSettingsModal } from "@/components/settings/settings-profile";
import { evmAddress, useAuthenticatedUser } from "@lens-protocol/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserPostCardProps {
  account: Account;
  stats: AccountStats | null;
}

export function UserPostCard({ account, stats }: UserPostCardProps) {
  const { data: currentUserProfile } = useAuthenticatedUser();

  const isUserProfile =
    currentUserProfile?.address &&
    currentUserProfile.address.toLowerCase() === evmAddress(account.address).toLowerCase();

  console.log(currentUserProfile?.address, account.address);

  return (
    <div
      className={cn(
        "flex p-4 border border-border rounded-lg bg-card text-card-foreground",
        "flex-col sm:flex-row items-stretch",
      )}
    >
      <div className="flex flex-col flex-shrink-0 w-full min-w-0">
        <Link prefetch href={`/u/${account.username?.localName}`} className="flex flex-row items-start gap-4 w-full">
          <UserAvatar account={account} size={12} className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <UserName account={account} className="text-lg font-semibold truncate" />
            {stats ? (
              <UserFollowing stats={stats} className="text-sm text-muted-foreground truncate" />
            ) : (
              <div className="text-sm text-muted-foreground truncate">Stats unavailable</div>
            )}
          </div>
        </Link>
        {account?.metadata?.bio && account.metadata.bio.length > 0 && (
          <div className="text-sm text-muted-foreground mt-4 max-w-full">
            <UserBio profile={account} />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow min-w-0 w-full mt-4 sm:mt-0 sm:justify-start sm:items-end">
        <div className="w-full sm:w-auto">
          {isUserProfile ? (
            <ProfileSettingsModal
              profile={account}
              trigger={
                <Button variant="outline" className="w-full sm:w-fit truncate">
                  Edit profile
                </Button>
              }
            />
          ) : (
            <UserFollowButton account={account} className="w-full sm:w-fit truncate" />
          )}
        </div>
      </div>
    </div>
  );
}
