"use client";

import { type Profile, useLazyProfile } from "@lens-protocol/react-web";
import { type PropsWithChildren, useState } from "react";
import { LoadingSpinner } from "../loading-spinner";
import { TruncatedText } from "../truncated-text";
import { Badge } from "../ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { UserAvatar } from "./user-avatar";

import Link from "next/link";
import { UserFollowButton } from "./user-follow";
import { UserFollowing } from "./user-following";
import { inter } from "@/styles/google-fonts";

type UserCardProps = PropsWithChildren & {
  handle?: string;
  linkProfile?: boolean;
};

export const UserCard = ({ children, handle, linkProfile = false }: UserCardProps) => {
  const { error, loading, execute } = useLazyProfile();
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadCard = () => {
    execute({ forHandle: `lens/${handle}` }).then((res) => {
      if (res.isSuccess()) {
        setProfile(res.unwrap());
      }
    });
  };

  const isFollowingMe = profile?.operations.isFollowingMe.value;

  return (
    <HoverCard  defaultOpen={false} onOpenChange={(open: boolean) => open && loadCard()} closeDelay={100}>
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
                  <UserAvatar profile={profile} className="w-8 h-8" />
                </div>
                <span className="flex flex-col">
                  <span className="font-bold">{profile.metadata?.displayName}</span>
                  <span className="font-light text-xs">@{profile.handle?.localName}</span>
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
              <UserFollowing profile={profile} />
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
