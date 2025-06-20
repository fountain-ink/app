"use client";

import { type Account } from "@lens-protocol/client";
import { fetchAccount, fetchAccountStats } from "@lens-protocol/client/actions";
import Link from "next/link";
import { type PropsWithChildren, useState } from "react";
import { getLensClient } from "@/lib/lens/client";
import { inter } from "@/styles/google-fonts";
import { LoadingSpinner } from "../misc/loading-spinner";
import { TruncatedText } from "../misc/truncated-text";
import { Badge } from "../ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { UserAvatar } from "./user-avatar";
import { UserFollowButton } from "./user-follow";
import { UserFollowing } from "./user-following";

type UserCardProps = PropsWithChildren & {
  username?: string;
  address?: string;
  linkProfile?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement | HTMLButtonElement>) => void;
};

export const UserCard = ({ children, username, address, onClick, linkProfile = false }: UserCardProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [stats, setStats] = useState<any>(null);

  const loadCard = async () => {
    if (!username && !address) return;

    setLoading(true);
    try {
      const client = await getLensClient();
      let result;

      if (username) {
        result = await fetchAccount(client, {
          username: {
            localName: username,
          },
        });
      } else if (address) {
        result = await fetchAccount(client, {
          address: address,
        });
      }

      if (!result || result.isErr()) {
        throw result?.error || new Error("Failed to fetch account");
      }

      const account = result.unwrapOr(null);
      setAccount(account);

      if (account) {
        const statsResult = await fetchAccountStats(client, { account: account.address });
        if (!statsResult.isErr()) {
          setStats(statsResult.unwrapOr(null));
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const isFollowingMe = account?.operations?.isFollowingMe;

  return (
    <HoverCard defaultOpen={false} onOpenChange={(open: boolean) => open && loadCard()} closeDelay={100}>
      <HoverCardTrigger className="z-20" asChild>
        {linkProfile && username ? (
          <Link prefetch href={`/u/${username}`} onClick={onClick}>
            {children}
          </Link>
        ) : (
          children
        )}
      </HoverCardTrigger>
      <HoverCardContent className={`w-full min-w-64 z-[101] max-w-fit overflow-hidden ${inter.className}`} side="top">
        {loading && !account && <LoadingSpinner />}
        {error && <div>Error: {error.message}</div>}
        {account && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row place-content-between items-start">
              <div className="flex flex-row items-center gap-2 text-sm">
                <UserAvatar account={account} className="w-12 h-12" />
              </div>

              <span className="flex flex-row gap-2 items-center justify-center">
                {isFollowingMe && (
                  <Badge
                    className="text-xs rounded-sm text-primary/70 bg-secondary/50 -mb-1 h-fit w-fit flex items-center justify-center ml-2"
                    variant="secondary"
                  >
                    Follows you
                  </Badge>
                )}
                <UserFollowButton account={account} />
              </span>
            </div>
            <span className="flex flex-col pt-2">
              <span className="font-bold text-xs">{account.metadata?.name}</span>
              <span className="font-light text-xs">@{account.username?.localName}</span>
            </span>
            <div className="text-xs mt-2 leading-4 line-clamp-5 break-words max-w-xs whitespace-pre-line">
              <TruncatedText text={account.metadata?.bio || ""} maxLength={400} isMarkdown={true} />
            </div>
            <div className="text-xs">
              <UserFollowing stats={stats} />
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
