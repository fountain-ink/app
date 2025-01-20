import { Account } from "@lens-protocol/client";

export const UserUsername = ({ account, className }: { account?: Account | null; className?: string }) => {
  const username = account?.username?.localName;
  if (!username) {
    return null;
  }

  return <div className={`text-foreground  ${className}`}>@{username}</div>;
};
