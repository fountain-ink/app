"use client";

import { getLensClient } from "@/lib/lens/client";
import { type Account } from "@lens-protocol/client";
import { fetchAccount, fetchAccountStats } from "@lens-protocol/client/actions";
import { type PropsWithChildren, useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { TruncatedText } from "../misc/truncated-text";
import { Badge } from "../ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { UserAvatar } from "./user-avatar";

import { inter } from "@/styles/google-fonts";
import Link from "next/link";
import { UserFollowButton } from "./user-follow";
import { UserFollowing } from "./user-following";

type UserCardProps = PropsWithChildren & {
  handle?: string;
  linkProfile?: boolean;
};

export const UserCard = ({ children, handle, linkProfile = false }: UserCardProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<Account | null>(null);
  const [stats, setStats] = useState<any>(null);

  const loadCard = async () => {
    if (!handle) return;

    setLoading(true);
    try {
      const client = await getLensClient();
      const result = await fetchAccount(client, {
        username: {
          localName: handle,
        },
      });

      if (result.isErr()) {
        throw result.error;
      }

      const account = result.unwrapOr(null);
      setProfile(account);

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

  const isFollowingMe = profile?.operations?.isFollowingMe;

  return (
    <HoverCard defaultOpen={false} onOpenChange={(open: boolean) => open && loadCard()} closeDelay={100}>
      <HoverCardTrigger asChild>
        {linkProfile && handle ? <Link href={`/u/${handle}/profile`}>{children}</Link> : children}
      </HoverCardTrigger>
      <HoverCardContent className={`w-full max-w-sm ${inter.className}`} side="top">
        {loading && !profile && <LoadingSpinner />}
        {error && <div>Error: {error.message}</div>}
        {profile && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row place-content-between items-center">
              <div className="flex flex-row items-center gap-2 text-sm">
                <div className="w-8 h-8">
                  <UserAvatar account={profile} className="w-8 h-8" />
                </div>
                <span className="flex flex-col">
                  <span className="font-bold">{profile.metadata?.name}</span>
                  <span className="font-light text-xs">@{profile.username?.localName}</span>
                </span>
              </div>

              <span className="flex flex-row gap-2 items-center justify-center">
                {isFollowingMe && (
                  <Badge className="text-xs h-fit w-fit mr-8 ml-2" variant="secondary">
                    Follows you
                  </Badge>
                )}
                <UserFollowButton profile={profile} />
              </span>
            </div>
            <div className="text-xs">
              <UserFollowing stats={stats} />
            </div>
            <div className="text-xs mt-2 leading-4">
              <TruncatedText text={profile.metadata?.bio || ""} maxLength={200} isMarkdown={true} />
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
