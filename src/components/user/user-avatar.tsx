"use client";

import { type Profile, SessionType, useSession } from "@lens-protocol/react-web";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Account } from "@lens-protocol/client";

export const SessionAvatar = () => {

  return null

  // const { data: session, loading, error } = useSession();

  // if (session?.type !== SessionType.WithProfile) {
  //   return null;
  // }

  // return <UserAvatar className="w-10 h-10" profile={session?.profile} loading={loading} error={error} />;
};

export const UserAvatar = ({
  profile,
  loading,
  error,
  className,
}: {
  profile?: Account;
  loading?: boolean;
  error?: Error;
  className?: string;
}) => {
  if (loading) {
    return <AvatarSuspense />;
  }

  if (error) {
    toast.error(error.message);
    return <AvatarSuspense />;
  }

  const avatar =
    profile?.metadata?.picture?.__typename === "ImageSet"
      ? profile?.metadata?.picture?.optimized?.uri || profile?.metadata?.picture?.raw?.uri
      : profile?.metadata?.picture?.image.optimized?.uri || profile?.metadata?.picture?.image.raw?.uri;

  return (
    <div className={className}>
      <Avatar className="w-full h-full m-0">
        <AvatarImage className="m-0" src={avatar} />
        <AvatarFallback>
          <AvatarSuspense />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export const AvatarSuspense = () => {
  return <div className="flex h-full w-full items-center justify-center rounded-full bg-muted" />;
};
