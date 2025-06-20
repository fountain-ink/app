"use client";

import { UserAvatar } from "@/components/user/user-avatar";
import { useCachedAccount } from "@/hooks/use-cached-account";
import { cn } from "@/lib/utils";

interface ChatUserInfoProps {
  address: string;
  showName?: boolean;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
}

export function ChatUserInfo({
  address,
  showName = true,
  className,
  avatarClassName,
  nameClassName,
}: ChatUserInfoProps) {
  const { account, loading } = useCachedAccount(address);

  const displayName =
    account?.username?.localName || account?.metadata?.name || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserAvatar
        account={account || undefined}
        loading={loading}
        className={cn("w-6 h-6", avatarClassName)}
        size={16}
      />
      {showName && <span className={cn("text-sm font-medium", nameClassName)}>{displayName}</span>}
    </div>
  );
}
