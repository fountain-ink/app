"use client";

import type { Account, AccountStats } from "@lens-protocol/client";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserName } from "@/components/user/user-name";
import { UserFollowing } from "@/components/user/user-following";
import { UserFollowButton } from "@/components/user/user-follow";
import { UserBio } from "@/components/user/user-bio";
import { Button } from "@/components/ui/button";
import { ProfileSettingsModal } from "@/components/settings/settings-profile";
import { useAuthenticatedUser } from "@lens-protocol/react";

interface UserPostCardProps {
  account: Account;
  stats: AccountStats | null;
}

export function UserPostCard({ account, stats }: UserPostCardProps) {
  const { data: currentUserProfile } = useAuthenticatedUser();

  const isUserProfile = !!currentUserProfile && currentUserProfile.address === account.address;

  return (
    <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card text-card-foreground">
      <UserAvatar account={account} size={12} className="w-12 h-12 rounded-full flex-shrink-0" />

      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col flex-grow mr-4 min-w-0">
            <UserName profile={account} className="text-lg font-semibold truncate" />
            {stats ? (
              <UserFollowing stats={stats} className="text-sm text-muted-foreground" />
            ) : (
              <div className="text-sm text-muted-foreground">Stats unavailable</div>
            )}
          </div>

          <div className="mt-1 flex-shrink-0">
            {isUserProfile ? (
              <ProfileSettingsModal
                profile={account}
                trigger={
                  <Button variant="outline" size="sm">
                    Edit profile
                  </Button>
                }
              />
            ) : (
              <UserFollowButton account={account} />
            )}
          </div>
        </div>

        {account?.metadata?.bio && account.metadata.bio.length > 0 && (
          <div className="text-sm text-muted-foreground mt-1">
            <UserBio profile={account} />
          </div>
        )}
      </div>
    </div>
  );
} 