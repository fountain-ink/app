import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserName = ({ profile, className }: { profile?: Profile | ProfileFragment; className?: string }) => {
  const name = profile?.metadata?.displayName;

  if (!name) {
    return null;
  }

  return <div className={`text-foreground text-3xl font-bold ${className}`}>{name}</div>;
};
