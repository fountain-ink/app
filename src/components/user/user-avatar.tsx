"use client";

import { Account } from "@lens-protocol/client";
import { User2Icon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const UserAvatar = ({
  account: profile,
  loading,
  error,
  className,
}: {
  account?: Account;
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

  const avatar = profile?.metadata?.picture;

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
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full border border-border">
      <User2Icon size={20} className="text-primary" />
    </div>
  );
};
