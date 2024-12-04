import type { ProfileFragment } from "@lens-protocol/client";

export const UserHandle = ({ profile, className }: { profile?: ProfileFragment | null; className?: string }) => {
  const handle = profile?.handle?.localName;
  if (!handle) {
    return null;
  }

  return <div className={`text-foreground text-lg ${className}`}>@{handle}</div>;
};
