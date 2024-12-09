"use client";

import { type Profile, useLazyProfile } from "@lens-protocol/react-web";
import { type PropsWithChildren, useState } from "react";
import { LoadingSpinner } from "../loading-spinner";
import { TruncatedText } from "../truncated-text";
import { Badge } from "../ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { UserAvatar } from "./user-avatar";

import Link from "next/link";

type UserCardProps = PropsWithChildren & {
  handle?: string;
  linkProfile?: boolean;
};

export const UserCard = ({ children, handle, linkProfile = false }: UserCardProps) => {
  const { error, loading, execute } = useLazyProfile();
  const [user, setUser] = useState<Profile | null>(null);

  const loadCard = () => {
    execute({ forHandle: `lens/${handle}` }).then((res) => {
      if (res.isSuccess()) {
        setUser(res.unwrap());
      }
    });
  };

  const isFollowingMe = user?.operations.isFollowingMe;

  return (
    <HoverCard defaultOpen={false} onOpenChange={(open: boolean) => open && loadCard()} closeDelay={100}>
      <HoverCardTrigger asChild>
        {linkProfile && handle ? <Link href={`/u/${handle}/profile`}>{children}</Link> : children}
      </HoverCardTrigger>
      <HoverCardContent className="w-full max-w-sm" side="top">
        {(loading && !user) && <LoadingSpinner />}
        {error && <div>Error: {error.message}</div>}
        {user && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2 text-sm">
              <div className="w-8 h-8">
                <UserAvatar profile={user} className="w-8 h-8" />
              </div>
              <span className="flex flex-col">
                <span className="font-bold">{user.metadata?.displayName}</span>
                <span className="font-light text-xs">@{user.handle?.localName}</span>
              </span>
              <span>
                {isFollowingMe && (
                  <Badge className="text-xs h-fit w-fit" variant="secondary">
                    Follows you
                  </Badge>
                )}
              </span>
            </div>
            <span className="text-xs leading-4">
              <TruncatedText text={user.metadata?.bio || ""} maxLength={200} isMarkdown={true} />
            </span>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
