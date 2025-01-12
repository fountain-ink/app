"use client"

import { Account } from "@lens-protocol/client";
import { EvmAddress } from "@lens-protocol/metadata";
import { useAccount } from "@lens-protocol/react";
import { UserAvatar } from "./user-avatar";
import { UserCard } from "./user-card";

export const LazyAuthorView = ({
  profileIds,
  showAvatar = true,
  showName = true,
  showHandle = true,
}: {
  profileIds: EvmAddress[];
  showAvatar?: boolean;
  showName?: boolean;
  showHandle?: boolean;
}) => {
  const { data: account, loading, error } = useAccount({ address: profileIds[0] });

  if (!account) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: profileIds.length }).map((_e, index) => (
          <span key={`skeleton-${index}-${profileIds[index]}`} className="flex flex-row gap-2 items-center">
            {showAvatar && <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />}
            {showName && <div className="w-20 h-4 bg-muted animate-pulse rounded-full" />}
            {showHandle && <div className="w-24 h-4 bg-muted animate-pulse rounded-full" />}
          </span>
        ))}
      </div>
    );
  }
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error loading profiles</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {[account].map((profile) => (
        <span key={profile.address} className="flex flex-row gap-2 items-center">
          {/* {showAvatar && <UserAvatar className="w-6 h-6" profile={profile} />} */}
          {showName && <b className="text-foreground">{profile.metadata?.name}</b>}
          {showHandle && <span className="text-foreground">@{profile.username?.localName}</span>}
        </span>
      ))}
    </div>
  );
};

export const AuthorView = ({
  profiles,
  showAvatar = true,
  showName = true,
  showHandle = true,
  showCard = true,
}: {
  profiles: Account[] | null;
  showAvatar?: boolean;
  showName?: boolean;
  showHandle?: boolean;
  showCard?: boolean;
}) => {
  if (!profiles || profiles.length === 0) return null;

  const conent = (
    <div className="flex flex-wrap gap-2">
      {profiles.map((profile) => {
        const item = (
          <span key={profile.address} className="flex flex-row gap-2 items-center">
            {showAvatar && <UserAvatar className="w-6 h-6" profile={profile} />}
            {showName && <span className="font-[family-name:--title-font]">{profile.metadata?.name}</span>}
            {showHandle && <span className="">@{profile.username?.localName}</span>}
          </span>
        );
        if (showCard) {
          return (
            <UserCard linkProfile handle={profile.username?.localName}>
              {item}
            </UserCard>
          );
        }

        return item;
      })}
    </div>
  );

  return conent;
};
