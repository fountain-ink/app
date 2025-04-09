import { Account } from "@lens-protocol/client";

export const UserName = ({ profile, className }: { profile?: Account; className?: string }) => {
  const name = profile?.metadata?.name;

  return <div className={`text-foreground h-10 text-3xl font-bold ${className}`}>{name}</div>;
};
