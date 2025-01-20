"use client";

import { Account } from "@lens-protocol/client";
import { EvmAddress } from "@lens-protocol/metadata";
import { useAccount } from "@lens-protocol/react";
import { UserAvatar } from "./user-avatar";
import { UserCard } from "./user-card";

export const LazyAuthorView = ({
  authors,
  showAvatar = true,
  showName = true,
  showUsername = true,
}: {
  authors: EvmAddress[];
  showAvatar?: boolean;
  showName?: boolean;
  showUsername?: boolean;
}) => {
  const { data: account, loading, error } = useAccount({ address: authors[0] });

  if (!account) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: authors.length }).map((_e, index) => (
          <span key={`skeleton-${index}-${authors[index]}`} className="flex flex-row gap-2 items-center">
            {showAvatar && <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />}
            {showName && <div className="w-20 h-4 bg-muted animate-pulse rounded-full" />}
            {showUsername && <div className="w-24 h-4 bg-muted animate-pulse rounded-full" />}
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
          {showUsername && <span className="text-foreground">@{profile.username?.localName}</span>}
        </span>
      ))}
    </div>
  );
};

export const AuthorView = ({
  accounts,
  showAvatar = true,
  showName = true,
  showUsername = true,
  showCard = true,
}: {
  accounts: Account[] | null;
  showAvatar?: boolean;
  showName?: boolean;
  showUsername?: boolean;
  showCard?: boolean;
}) => {
  if (!accounts || accounts.length === 0) return null;

  const conent = (
    <div className="flex flex-wrap gap-2">
      {accounts.map((acc) => {
        const item = (
          <span key={acc.address} className="flex flex-row gap-2 items-center">
            {showAvatar && <UserAvatar className="w-6 h-6" account={acc} />}
            {showName && <span className="font-[family-name:--title-font]">{acc.metadata?.name}</span>}
            {showUsername && <span className="text-sm">@{acc.username?.localName}</span>}
          </span>
        );

        if (showCard) {
          return (
            <UserCard linkProfile username={acc.username?.localName}>
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
