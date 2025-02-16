"use client";

import { Account } from "@lens-protocol/client";
import { User2Icon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const UserAvatar = ({
  account,
  loading,
  error,
  size = 20,
  className,
}: {
  account?: Account;
  loading?: boolean;
  size?: number;
  error?: Error;
  className?: string;
}) => {
  if (loading) {
    return <AvatarSuspense size={size} />;
  }

  if (error) {
    toast.error(error.message);
    return <AvatarSuspense size={size} />;
  }

  const avatar = account?.metadata?.picture;

  return (
    <div className={className}>
      <Avatar className="w-full h-full m-0">
        <AvatarImage className="m-0" src={avatar} />
        <AvatarFallback>
          <AvatarSuspense size={size} />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export const AvatarSuspense = ({ size = 20 }: { size?: number }) => {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full border-none">
      <User2Icon size={size} className="text-primary" />
    </div>
  );
};
