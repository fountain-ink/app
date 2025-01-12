import { Account } from "@lens-protocol/client";

export const UserName = ({ profile, className }: { profile?: Account; className?: string }) => {
  const name = profile?.metadata?.name;

  if (!name) {
    return null;
  }

  return <div className={`text-foreground text-3xl font-bold ${className}`}>{name}</div>;
};
