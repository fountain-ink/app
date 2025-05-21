import { Account } from "@lens-protocol/client";

export const UserName = ({ account, className }: { account?: Account; className?: string }) => {
  const name = account?.metadata?.name;

  if (!account) {
    return <UserNameSkeleton />;
  }

  if (!name || name === "") {
    return <div className="h-5" />;
  }

  return <div className={`text-foreground text-3xl max-w-[600px] font-bold ${className}`}>{name}</div>;
};

export const UserNameSkeleton = () => {
  return <div className="h-5 w-20 bg-muted-foreground/20 animate-pulse rounded-full" />;
};
