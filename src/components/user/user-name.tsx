import { Account } from "@lens-protocol/client";

export const UserName = ({ profile, className }: { profile?: Account; className?: string }) => {
  const name = profile?.metadata?.name;

  if (!name || name === "") {
    return <div className="h-5"></div>
  }

  return <div className={`text-foreground text-3xl max-w-[600px] font-bold ${className}`}>{name}</div>;
};
