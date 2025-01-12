import { Account } from "@lens-protocol/client";

export const UserHandle = ({ profile, className }: { profile?: Account | null; className?: string }) => {
  const handle = profile?.username?.localName;
  if (!handle) {
    return null;
  }

  return <div className={`text-foreground  ${className}`}>@{handle}</div>;
};
